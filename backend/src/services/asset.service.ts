import { Repository, In } from "typeorm";
import { v4 as uuidv4 } from 'uuid'
import { AppDataSource } from "../database/db";
import { Asset } from "../entities/asset.entities";
import { Category } from "../entities/category.entities";
import { Tag } from "../entities/tag.entities";
import { AuthRequest } from "../interfaces/auth.interface";
import { deleteImage } from "../utils/imageVercel";
import { HttpError } from "../error/HttpError";
import logger from "../logger/app.logger";
import rabbitMq from "../queue/rabbitMq";
import { LicenseService } from "./license.service";
import { ASSET_QUEUE, UPDATE_ASSET_QUEUE } from "../config/env";



export class AssetService {
  private assetRepository: Repository<Asset>;
  private categoryRepository: Repository<Category>;
  private tagRepository: Repository<Tag>;
  private licenseService: LicenseService;

  constructor() {
    this.assetRepository = AppDataSource.getRepository(Asset);
    this.categoryRepository = AppDataSource.getRepository(Category);
    this.tagRepository = AppDataSource.getRepository(Tag);
    this.licenseService = new LicenseService()

  }
  async create(req: AuthRequest) {
    const user = req.user;
    const data = req.body;
    const files = req.files as { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };
    const file = files.file?.[0];        // main file

    const category = data.category ? await this.categoryRepository.findOne({ where: { id: data.category } }) : null;
    if (!category) throw new Error("Category not found");

    const tagsId = data.tagsId ? JSON.parse(data.tagsId) : null;
    const tags = tagsId ? await this.tagRepository.findBy({ id: In(tagsId) }) : null;
    if (!tags || tags.length === 0) throw new Error("Tags not found");

    // Handle main file upload (images only for now)
    if (!file) {
      throw new Error("File not found");
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;



    const assetData = {
      name: data.name,
      description: data.description,
      price: data.license === "premium" ? data.price : 0,
      file_url: "",
      file_type: data.file_type,
      size: file.size,
      user,
      category,
      tags,
      thumbnail_url: "",
      license: data.license || 'premium',
    };

    const asset = this.assetRepository.create(assetData);
    const savedAsset = await this.assetRepository.save(asset);
    let thumbName = `${savedAsset.id}-thumbnail.webp`;

    const payload = {
      assetId: asset.id,
      files: [
        { filename: fileName, type: "file", size: file.size },
        { filename: thumbName, type: "thumbnail", size: 0 }
      ]
    };
    const header = Buffer.from(JSON.stringify(payload) + '\0');
    const combined = Buffer.concat([header, file.buffer]);
    if (ASSET_QUEUE) {
      await rabbitMq.publishImages(ASSET_QUEUE, combined)
    } else {
      throw new HttpError("Unable to publish image due to asset queue error", 401)
    }
    return savedAsset;
  }


  async findAll(): Promise<Asset[]> {
    return await this.assetRepository.find();
  }

  async save(asset: Asset): Promise<void> {
    await this.assetRepository.save(asset)
  }

  async findOne(id: string): Promise<Asset | null> {
    try {
      const asset = await this.assetRepository
        .createQueryBuilder('asset')
        .select(['asset', "tags", 'user.id', 'user.name', 'user.email'])
        .leftJoin('asset.user', 'user')
        .leftJoinAndSelect('asset.tags', 'tags')
        .where("asset.id = :id", { id: id })
        .getOne();
      return asset;
    } catch (error) {
      console.error("Error fetching asset with tags:", error);
      throw error;
    }
  }


  async update(id: string, req: AuthRequest): Promise<Asset | null> {
    try {
      const data = req.body;
      if (req.user === undefined) {
        throw new HttpError("You are not authorized to update this asset", 403);
      }
      const existingAsset = await this.assetRepository.findOne({
        where: { id: id, user: { id: req.user.id } },
        relations: ["tags", "category"]
      });
      if (!existingAsset) {
        throw new HttpError("Asset not found", 404);
      }

      if (new Date().getTime() - existingAsset.created_at.getTime() > 1000 * 60 * 60 * 24) {
        throw new HttpError("You can't update this asset after 24 hours", 403);
      }
      // Category validation if provided
      let updatedCategory = existingAsset.category;
      if (data.category) {
        let categoryId: string;
        if (typeof data.category === 'string') {
          categoryId = data.category;
        } else if (data.category && typeof data.category === 'object' && 'id' in data.category) {
          categoryId = data.category.id;
        } else {
          throw new HttpError("Invalid category format", 400);
        }
        const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) {
          throw new HttpError("Category not found", 404);
        }
        updatedCategory = category;
      }

      // Tags validation if provided
      let updatedTags = existingAsset.tags;
      if (data.tagsId) {
        let tagIds: string[];
        try {
          tagIds = JSON.parse(data.tagsId);
          if (!Array.isArray(tagIds)) {
            throw new Error("Parsed tagsId is not an array");
          }
        } catch (parseError) {
          throw new HttpError("Invalid tagsId format: must be a JSON array of strings", 400);
        }
        const tags = await this.tagRepository.findBy({ id: In(tagIds) });
        if (tags.length !== tagIds.length) {
          throw new HttpError("One or more tags not found", 404);
        }
        updatedTags = tags;
      }

      // Handle file and thumbnail updates
      const files = req.files as { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] } | undefined;
      const file = files?.file?.[0];

      if (!UPDATE_ASSET_QUEUE) {
        throw new HttpError("Invalid update queue configuration", 500);
      }
      const uuidRegex = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(\.[a-zA-Z0-9]+)?/;

      // Update the asset properties
      Object.assign(existingAsset, {
        name: data.name !== undefined ? data.name : existingAsset.name,
        description: data.description !== undefined ? data.description : existingAsset.description,
        price: data.price !== undefined ? data.price : existingAsset.price,
        size: file ? file.size : existingAsset.size,
        file_type: data.file_type !== undefined ? data.file_type : existingAsset.file_type,
        category: updatedCategory,
        tags: updatedTags
      });

      // Save the updated asset
      const savedAsset = await this.assetRepository.save(existingAsset);
      logger.info(`Successfully updated asset with id: ${id}`);

      // Asset file update
      if (file) {
        await this.handleImageUpdate(existingAsset, file, uuidRegex);
      }

      return savedAsset;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error updating asset: ${errorMessage}`);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(`Failed to update asset: ${errorMessage}`, 500);
    }
  }

  private async handleImageUpdate(existingAsset: Asset, file: Express.Multer.File, uuidRegex: RegExp): Promise<void> {
    try {
      let match: RegExpMatchArray | null = null;
      let filename: string = "asset/";
      let thumbnailUrl: string = "asset/";

      if (existingAsset.file_url) {
        match = existingAsset.file_url.match(uuidRegex);
        if (!match) {
          throw new HttpError("Invalid existing file URL format", 400);
        }
        filename += match[0];
      } else {
        const license = await this.licenseService.findOneByAsset(existingAsset.id);
        if (!license) {
          throw new HttpError("No existing file or license found. Delete the asset and reupload", 404);
        }
        match = license.downloadUrl.match(uuidRegex);
        if (!match) {
          throw new HttpError("Invalid license", 400);
        }
        filename += match[0];
      }

      if (existingAsset.thumbnail_url) {
        thumbnailUrl = `${existingAsset.id}-thumbnail.webp`;
      } else {
        throw new HttpError("No existing thumbnail found. Delete the asset and reupload", 404)
      }

      if (!UPDATE_ASSET_QUEUE) {
        logger.error("Unable to update asset: No queue found")
        throw new HttpError("Unable to update asset", 500)
      }

      await rabbitMq.publishUpdates(UPDATE_ASSET_QUEUE, file.buffer, {
        type: "image",
        assetId: existingAsset.id,
        filename,
        thumbnailUrl,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpError(`Failed to handle file update: ${errorMessage}`, 500);
    }
  }


  async getCounts(req: AuthRequest): Promise<number> {
    try {
      logger.info(`Fetching count of all assets`);
      let count: number = 0;
      if (req.user === undefined) {
        count = await this.assetRepository.count();
      }
      else if (req.user.role === 'admin') {
        count = await this.assetRepository.count();
      }
      else {
        count = await this.assetRepository.count({ where: { user: { id: req.user.id } } });
      }
      logger.info(`Successfully retrieved asset count: ${count}`);
      return count;
    } catch (error) {
      logger.error(`Error fetching asset count: ${error}`);
      throw new Error("Failed to fetch asset count");
    }
  }

  async remove(id: string, req: AuthRequest): Promise<void> {
    try {
      const asset = await this.assetRepository.findOne({ where: { id, status: "approved" }, relations: ['user'] });
      if (!asset) {
        throw new HttpError("Asset not found", 404)
      }
      const user = req.user;
      if (!user) {
        throw new HttpError("User not found", 404)
      }
      if (asset.user.id !== user.id && user.role !== 'admin') {
        throw new HttpError("You are not authorized to delete this asset", 403)
      }
      if (asset.status === "deleted") {
        throw new HttpError("Asset already deleted", 400)
      }
      asset.status = "deleted";
      asset.deleted_at = new Date();
      asset.is_deleted = true;
      await this.assetRepository.save(asset);

    } catch (error) {
      throw new Error("Encountered Error while trying to delete asset")

    }
  }
}

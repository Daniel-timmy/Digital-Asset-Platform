import { Repository, In } from "typeorm";
import { v4 as uuidv4 } from 'uuid'
import { AppDataSource } from "../database/db";
import { Asset } from "../entities/asset.entities";
import { Category } from "../entities/category.entities";
import { Tag } from "../entities/tag.entities";
import { AuthRequest } from "interfaces/auth.interface";
import convertToWebP from "../utils/convertToWebP.utils";
import uploadImage, { deleteImage, updateImage } from "../utils/imageVercel";
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
    if (!user) throw new Error("User not found");
    const data = req.body;
    const files = req.files as { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };
    const file = files.file?.[0];        // main file
    const thumbnail = files.thumbnail?.[0]; // thumbnail file

    if (!file) throw new Error("File not found");
    if (!file) throw new Error("File not found");

    const category = data.category ? await this.categoryRepository.findOne({ where: { id: data.category } }) : null;
    if (!category) throw new Error("Category not found");

    const tagsId = data.tagsId ? JSON.parse(data.tagsId) : null;
    const tags = tagsId ? await this.tagRepository.findBy({ id: In(tagsId) }) : null;
    if (!tags || tags.length === 0) throw new Error("Tags not found");

    // Handle main file upload (image/video/pdf/svg/template)
    if (!file) {
      throw new Error("File not found");
    }
    if (!thumbnail) {
      throw new Error("Thumbnail not found");
    }
    if (!thumbnail.mimetype.startsWith("image/") && !thumbnail.mimetype.startsWith("video/")) {
      throw new Error("Thumbnail must be image or video");
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    let thumbBuffer = thumbnail.buffer;
    let thumbName = `${uuidv4()}`;
    
    const ext = thumbnail.originalname.split('.').pop();
    if (thumbnail.mimetype.startsWith("image/")) {
      // Convert to webp
      const webpThumb = await convertToWebP(thumbnail);
      thumbName += ".webp";
      thumbBuffer = webpThumb.buffer
    } else {
      thumbName += `.${ext}`;
    }
    
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
    const payload = {
      assetId: asset.id,
        files: [
          { filename: fileName, type: "file", size: file.size },
          { filename: thumbName,type: "thumbnail", size: thumbBuffer.length }
        ]
    };
    const header = Buffer.from(JSON.stringify(payload) + '\0');
    const combined = Buffer.concat([header, file.buffer, thumbBuffer]);
    if (ASSET_QUEUE){
      await rabbitMq.publishImages(ASSET_QUEUE, combined)
    } else {
      throw new HttpError("Unable to publish image due to asset queue error", 401)
    }
    return savedAsset;
  }


    async findAll(): Promise<Asset[]> {
      return await this.assetRepository.find();
    }

    async save(asset: Asset): Promise<void>{
      await this.assetRepository.save(asset)
    }

    async findOne(id: string): Promise<Asset | null> {
      try {

    const asset = await this.assetRepository
       .createQueryBuilder('asset')
       .select(['asset',"tags", 'user.id', 'user.name', 'user.email'])
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

    // async update(id: string, req: AuthRequest): Promise<Asset | null> {
    //   try {
    //     const data = req.body;
    //     if (req.user === undefined) {
    //       throw new HttpError("You are not authorized to update this asset", 403);
    //     }
    //     const existingAsset = await this.assetRepository.findOne({ 
    //       where: { id: id, user: { id: req.user.id } },
    //       relations: ["tags", "category"]
    //      });
    //     if (!existingAsset) {
    //       throw new HttpError("Asset not found", 404);
    //     }

    //     // Category validation if provided
    //     if (data.category) {
    //       const categoryId = typeof data.category === 'string' ? data.category : data.category.id;
    //       const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    //       if (!category) throw new HttpError("Category not found", 404);
    //       data.category = category;
    //     }

    //     // Tags validation if provided
    //     if (data.tagsId) {
    //       const tagIds = data.tagsId ? JSON.parse(data.tagsId) : null;
    //       const tags = await this.tagRepository.findBy({ id: In(tagIds) });
    //       if (!tags || tags.length === 0) throw new HttpError("Tags not found", 404);
    //       data.tags = tags;
    //     }

    //     // Handle file and thumbnail updates
    //     let file_url = existingAsset.file_url;
    //     const files = req.files as { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };
    //     const file = files.file?.[0];        // main file
    //     const thumbnail = files.thumbnail?.[0]; // thumbnail file

    //     if (!UPDATE_ASSET_QUEUE) throw new Error("Invalid update queue name")
    //     // Main file update
    //     const uuidRegex = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(\.[a-zA-Z0-9]+)?/;
    //     let match = file_url.match(uuidRegex)
    //     if (!match) throw new Error()
    //     if (file) {
    //       if (existingAsset.file_url) {
    //         await rabbitMq.publishUpdates(UPDATE_ASSET_QUEUE, file.buffer, 
    //           {
    //             type: "file",
    //             assetId: existingAsset.id,
    //             filename: "asset/" + match[0]
    //            })
    //       } else{
    //         const license = await this.licenseService.findOneByAsset(existingAsset.id)
    //         if (!license) throw new Error("No existing file found. Delete the sset and reupload")
    //         match = license.downloadUrl.match(uuidRegex)
    //         if (!match) throw new Error()
    //         await rabbitMq.publishUpdates(UPDATE_ASSET_QUEUE, file.buffer, 
    //           {
    //             type: "file",
    //             assetId: existingAsset.id,
    //             filename: "asset/" + match[0]
    //           })         
    //       }
    //     } 

    //     // Thumbnail update
    //     if (thumbnail) {
    //       let thumbBuffer= thumbnail.buffer
    //       let uploadUrl = "asset/"
    //       let thumbName = `${uuidv4()}`;
    //       match = existingAsset.thumbnail_url.match(uuidRegex)
    //       if (!match) throw new Error()

    //       uploadUrl += match[0]
    //       if (!uploadUrl) {
    //         uploadUrl = `asset/`
    //         if (thumbnail.mimetype.startsWith("image/")) {
    //           const webpThumb = await convertToWebP(thumbnail);
    //           thumbName += ".webp";
    //           thumbBuffer = webpThumb.buffer
    //           uploadUrl += thumbName
              
    //         } else if (thumbnail.mimetype.startsWith("video/")) {
    //           const ext = thumbnail.originalname.split('.').pop();
    //           thumbName += `.${ext}`;
    //           uploadUrl += thumbName
    //         } else {
    //           throw new Error("Thumbnail must be image or video");
    //         }
    //       } 
    //       await rabbitMq.publishUpdates(UPDATE_ASSET_QUEUE, thumbBuffer, 
    //           {
    //             type: "file",
    //             assetId: existingAsset.id,
    //             filename: uploadUrl
    //       })
    //     }    

    //     // Update the asset properties
    //     Object.assign(existingAsset, {
    //       name: data.name !== undefined ? data.name : existingAsset.name,
    //       description: data.description !== undefined ? data.description : existingAsset.description,
    //       price: data.price !== undefined ? data.price : existingAsset.price,
    //       size: file ? file.size : existingAsset.size,
    //       file_type: data.file_type !== undefined ? data.file_type : existingAsset.file_type,
    //       category: data.category !== undefined ? data.category : existingAsset.category,
    //       tags: data.tags !== undefined ? data.tags : existingAsset.tags
    //     });

    //     // Save the updated asset
    //     const savedAsset = await this.assetRepository.save(existingAsset);
    //     logger.info(`Successfully updated asset with id: ${id}`);

    //     return savedAsset;
    //   } catch (error: unknown) {
    //     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    //     logger.error(`Error updating asset: ${errorMessage}`);
    //     throw error instanceof HttpError ? error : new HttpError(`Failed to update asset: ${errorMessage}`, 500);
    //   }
    // }
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
    const thumbnail = files?.thumbnail?.[0];

    if (!UPDATE_ASSET_QUEUE) {
      throw new HttpError("Invalid update queue configuration", 500);
    }

    const uuidRegex = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(\.[a-zA-Z0-9]+)?/;

    // Main file update
    if (file) {
      await this.handleFileUpdate(existingAsset, file, uuidRegex);
    }

    // Thumbnail update
    if (thumbnail) {
      await this.handleThumbnailUpdate(existingAsset, thumbnail, uuidRegex);
    }

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

private async handleFileUpdate(existingAsset: Asset, file: Express.Multer.File, uuidRegex: RegExp): Promise<void> {
  try {
    let match: RegExpMatchArray | null = null;
    let filename: string;

    if (existingAsset.file_url) {
      match = existingAsset.file_url.match(uuidRegex);
      if (!match) {
        throw new HttpError("Invalid existing file URL format", 400);
      }
      filename = "asset/" + match[0];
    } else {
      const license = await this.licenseService.findOneByAsset(existingAsset.id);
      if (!license) {
        throw new HttpError("No existing file or license found. Delete the asset and reupload", 404);
      }
      match = license.downloadUrl.match(uuidRegex);
      if (!match) {
        throw new HttpError("Invalid license download URL format", 400);
      }
      filename = "asset/" + match[0];
    }
    if (!UPDATE_ASSET_QUEUE) throw new Error("No queue found: Unable to update ")

    await rabbitMq.publishUpdates(UPDATE_ASSET_QUEUE, file.buffer, {
      type: "file",
      assetId: existingAsset.id,
      filename
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new HttpError(`Failed to handle file update: ${errorMessage}`, 500);
  }
}

private async handleThumbnailUpdate(existingAsset: Asset, thumbnail: Express.Multer.File, uuidRegex: RegExp): Promise<void> {
  try {
    let thumbBuffer = thumbnail.buffer;
    let uploadUrl = "asset/";
    let thumbName = `${uuidv4()}`;
    let match: RegExpMatchArray | null = null;

    if (existingAsset.thumbnail_url) {
      match = existingAsset.thumbnail_url.match(uuidRegex);
      if (!match) {
        throw new HttpError("Invalid existing thumbnail URL format", 400);
      }
      // Extract UUID and optionally reuse or update extension based on new mime type
      const uuidPart = match[1]; // UUID without extension
      let newExt = match[2] || ''; // Existing extension if any

      // Update extension based on new thumbnail type
      if (thumbnail.mimetype.startsWith("image/")) {
        const webpThumb = await convertToWebP(thumbnail);
        thumbBuffer = webpThumb.buffer;
        newExt = ".webp";
      } else if (thumbnail.mimetype.startsWith("video/")) {
        const ext = thumbnail.originalname.split('.').pop() || 'mp4'; // Default to mp4 if no ext
        newExt = `.${ext}`;
      } else {
        throw new HttpError("Thumbnail must be an image or video", 400);
      }

      uploadUrl += uuidPart + newExt;
    } else {
      // No existing thumbnail, generate new
      if (thumbnail.mimetype.startsWith("image/")) {
        const webpThumb = await convertToWebP(thumbnail);
        thumbBuffer = webpThumb.buffer;
        thumbName += ".webp";
      } else if (thumbnail.mimetype.startsWith("video/")) {
        const ext = thumbnail.originalname.split('.').pop() || 'mp4';
        thumbName += `.${ext}`;
      } else {
        throw new HttpError("Thumbnail must be an image or video", 400);
      }
      uploadUrl += thumbName;
    }
    if (!UPDATE_ASSET_QUEUE) throw new Error("No queue found: Unable to update ")


    await rabbitMq.publishUpdates(UPDATE_ASSET_QUEUE, thumbBuffer, {
      type: "file",
      assetId: existingAsset.id,
      filename: uploadUrl
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new HttpError(`Failed to handle thumbnail update: ${errorMessage}`, 500);
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
      const asset = await this.assetRepository.findOne({ where: { id }, relations: ['user'] });
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
      // Offload to the background job later
      await this.assetRepository.delete(id);
      await deleteImage(asset.thumbnail_url)
      await deleteImage(asset.file_url)

      } catch(error){
        console.log(error)
        throw new Error("Encountered Error while trying to delete asset")

      }
    }
  }

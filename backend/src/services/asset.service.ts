import { Repository, In } from "typeorm";
import fs from "fs"
import path from "path"
import { v4 as uuidv4} from 'uuid'
import { AppDataSource } from "../database/db";
import { Asset } from "../entities/asset.entities";
import { User } from "../entities/user.entities";
import { Category } from "../entities/category.entities";
import { Tag } from "../entities/tag.entities";
import { AuthRequest } from "interfaces/auth.interface";
import convertToWebP from "../utils/convertToWebP.utils";
import uploadImage, {deleteImage} from "../utils/imageVercel";
import { uploadImageLocal, deleteImageLocal } from "../utils/imageLocal";
import { HttpError } from "../error/HttpError";
import logger from "../logger/app.logger";


export class AssetService {
  private assetRepository: Repository<Asset>;
  private userRepository: Repository<User>;
  private categoryRepository: Repository<Category>;
  private tagRepository: Repository<Tag>;

  constructor() {
    this.assetRepository = AppDataSource.getRepository(Asset);
    this.userRepository = AppDataSource.getRepository(User);
    this.categoryRepository = AppDataSource.getRepository(Category);
    this.tagRepository = AppDataSource.getRepository(Tag);
  }
async create(req: AuthRequest) {
  const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
  if (!user) throw new Error("User not found");

  if (user.role !== "admin") throw new Error("User not an admin");

  const data = req.body;
  const file = req?.file;
  if (!file) throw new Error("File not found");

  const category = data.category ? await this.categoryRepository.findOne({ where: { id: data.category } }) : null;
  if (!category) throw new Error("Category not found");

  const tagsId = data.tagsId ? JSON.parse(data.tagsId) : null;
  const tags = tagsId ? await this.tagRepository.findBy({ id: In(tagsId) }) : null;
  if (!tags || tags.length === 0) throw new Error("Tags not found");

  const assetData = {
    name: data.name,
    description: data.description,
    price: data.price,
    file_url: data.file_url,
    user,
    category,
    tags,
  };

  const asset = this.assetRepository.create(assetData);
  const assetName = uuidv4();
  const thumbnailName = `${assetName}.webp`;

  // Handle thumbnail generation and storage
  try {
    const thumbnail = await convertToWebP(file);
    if (!thumbnail || !Buffer.isBuffer(thumbnail.buffer)) {
      throw new Error("Invalid thumbnail format");
    }
    // asset.thumbnail_url = await uploadImageLocal(thumbnailName, thumbnail.buffer, 'thumbnail')

    asset.thumbnail_url = await uploadImage(thumbnailName, thumbnail.buffer, "asset"); // Store relative URL
  } catch (error) {
    throw new Error(`Failed to process thumbnail: ${error}`);
  }

  const savedAsset = await this.assetRepository.save(asset);
  return savedAsset;
}

  async findAll(): Promise<Asset[]> {
    return await this.assetRepository.find();
  }

  async findOne(id: string): Promise<Asset | null> {
    try {
      const asset = await this.assetRepository
        .createQueryBuilder("asset")
        .leftJoinAndSelect("asset.tags", "tags") 
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
      // Check if asset exists
      const existingAsset = await this.assetRepository.findOne({ where: { id } });
      if (!existingAsset) {
        throw new HttpError("Asset not found", 404);
      }


      // Category validation if provided
      if (data.category) {
        const categoryId = typeof data.category === 'string' ? data.category : data.category.id;
        const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) throw new HttpError("Category not found", 404);
        data.category = category;
      }


      // Tags validation if provided
      if (data.tagsId) {
        const tagIds = data.tagsId ? JSON.parse(data.tagsId) : null;
        const tags = await this.tagRepository.findBy({ id: In(tagIds) });
        if (!tags || tags.length === 0) throw new HttpError("Tags not found", 404);
        data.tags = tags;
      }

      // Handle thumbnail update if file is provided
      if (req?.file) {
        try {
          // Delete old thumbnail if it exists
          if (existingAsset.thumbnail_url) {
            await deleteImage(existingAsset.thumbnail_url);
          }

          const thumbnail = await convertToWebP(req.file);
          if (!thumbnail || !Buffer.isBuffer(thumbnail.buffer)) {
            throw new Error("Invalid thumbnail format");
          }

          const assetName = uuidv4();
          const thumbnailName = `${assetName}.webp`;
          data.thumbnail_url = await uploadImage(thumbnailName, thumbnail.buffer, "asset");
        } catch (error) {
          logger.error(`Failed to process thumbnail: ${error}`);
          throw new HttpError(`Failed to process thumbnail: ${error}`, 500);
        }
      }

      // Load the existing asset with relations
      const asset = await this.assetRepository.findOne({
        where: { id },
        relations: ["tags", "category"]
      });

      if (!asset) {
        throw new HttpError("Asset not found", 404);
      }

      // Update the asset properties
      Object.assign(asset, {
        name: data.name !== undefined ? data.name : asset.name,
        description: data.description !== undefined ? data.description : asset.description,
        price: data.price !== undefined ? data.price : asset.price,
        file_url: data.file_url !== undefined ? data.file_url : asset.file_url,
        thumbnail_url: data.thumbnail_url !== undefined ? data.thumbnail_url : asset.thumbnail_url,
        category: data.category !== undefined ? data.category : asset.category,
        tags: data.tags !== undefined ? data.tags : asset.tags
      });

      // Save the updated asset
      const savedAsset = await this.assetRepository.save(asset);
      logger.info(`Successfully updated asset with id: ${id}`);
      
      return savedAsset;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error updating asset: ${errorMessage}`);
      throw error instanceof HttpError ? error : new HttpError(`Failed to update asset: ${errorMessage}`, 500);
    }
  }

  async getCounts(): Promise<number> {
    try {
      logger.info(`Fetching count of all assets`);
      const count = await this.assetRepository.count();
      logger.info(`Successfully retrieved asset count: ${count}`);
      return count;
    } catch (error) {
      logger.error(`Error fetching asset count: ${error}`);
      throw new Error("Failed to fetch asset count");
    }
  }

  async remove(id: string): Promise<void> {
    try {
    const asset = await this.assetRepository.findOne({ where: { id } });
    if (!asset) {
      throw new HttpError("Asset not found", 404)
    }
    // await deleteImageLocal(asset.thumbnail_url)
    await deleteImage(asset.thumbnail_url)
    await this.assetRepository.delete(id);

    } catch(error){
      throw new Error("Encountered Error while trying to delete asset")
    }
  }
}

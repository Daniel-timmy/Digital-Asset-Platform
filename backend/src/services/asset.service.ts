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

  async update(id: string, data: Partial<Asset>): Promise<Asset | null> {
    await this.assetRepository.update(id, data);
    return await this.assetRepository.findOne({ where: { id } });
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

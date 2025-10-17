import { Repository, In } from "typeorm";
import { v4 as uuidv4 } from 'uuid'
import { AppDataSource } from "../database/db";
import { Asset } from "../entities/asset.entities";
import { Category } from "../entities/category.entities";
import { Tag } from "../entities/tag.entities";
import { AuthRequest } from "interfaces/auth.interface";
import convertToWebP from "../utils/convertToWebP.utils";
import uploadImage, { deleteImage } from "../utils/imageVercel";
import { HttpError } from "../error/HttpError";
import logger from "../logger/app.logger";


export class AssetService {
  private assetRepository: Repository<Asset>;
  private categoryRepository: Repository<Category>;
  private tagRepository: Repository<Tag>;

  constructor() {
    this.assetRepository = AppDataSource.getRepository(Asset);
    this.categoryRepository = AppDataSource.getRepository(Category);
    this.tagRepository = AppDataSource.getRepository(Tag);
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

  let file_url = "";
  let thumbnail_url = "";

  // Handle main file upload (image/video/pdf/svg/template)
  if (file) {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    file_url = await uploadImage(fileName, file.buffer, "asset");
  }

  // Handle thumbnail upload
  if (thumbnail) {
    let thumbBuffer = thumbnail.buffer;
    let thumbName = `${uuidv4()}`;
    if (thumbnail.mimetype.startsWith("image/")) {
      // Convert to webp
      const webpThumb = await convertToWebP(thumbnail);
      if (!webpThumb || !Buffer.isBuffer(webpThumb.buffer)) {
        throw new Error("Invalid thumbnail format");
      }
      thumbName += ".webp";
      thumbnail_url = await uploadImage(thumbName, webpThumb.buffer, "asset");
    } else if (thumbnail.mimetype.startsWith("video/")) {
      // Upload as-is
      const ext = thumbnail.originalname.split('.').pop();
      thumbName += `.${ext}`;
      thumbnail_url = await uploadImage(thumbName, thumbBuffer, "asset");
    } else {
      throw new Error("Thumbnail must be image or video");
    }
  } else if (data.thumbnail_url) {
    thumbnail_url = data.thumbnail_url;
  }

  const assetData = {
    name: data.name,
    description: data.description,
    price: data.price,
    file_url: file_url,
    file_type: data.file_type,
    user,
    category,
    tags,
    thumbnail_url: thumbnail_url,
  };

  const asset = this.assetRepository.create(assetData);
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
      if (req.user === undefined) {
        throw new HttpError("You are not authorized to update this asset", 403);
      }
      const existingAsset = await this.assetRepository.findOne({ where: { id: id, user: { id: req.user.id } } });
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

      // Handle file and thumbnail updates
      let file_url = existingAsset.file_url;
      let thumbnail_url = existingAsset.thumbnail_url;
      const files = req.files as { file?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };
      const file = files.file?.[0];        // main file
      const thumbnail = files.thumbnail?.[0]; // thumbnail file
        
      if (!file) throw new Error("File not found");
      if (!file) throw new Error("File not found");


      // Main file update
      if (file) {
        if (existingAsset.file_url) {
          await deleteImage(existingAsset.file_url);
        }
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        file_url = await uploadImage(fileName, file.buffer, "asset");
      } else {
        
        file_url = existingAsset.file_url;
      }

      // Thumbnail update
      if (thumbnail) {
        if (existingAsset.thumbnail_url) {
          await deleteImage(existingAsset.thumbnail_url);
        }
        let thumbBuffer = thumbnail.buffer;
        let thumbName = `${uuidv4()}`;
        if (thumbnail.mimetype.startsWith("image/")) {
          const webpThumb = await convertToWebP(thumbnail);
          if (!webpThumb || !Buffer.isBuffer(webpThumb.buffer)) {
            throw new Error("Invalid thumbnail format");
          }
          thumbName += ".webp";
          thumbnail_url = await uploadImage(thumbName, webpThumb.buffer, "asset");
        } else if (thumbnail.mimetype.startsWith("video/")) {
          const ext = thumbnail.originalname.split('.').pop();
          thumbName += `.${ext}`;
          thumbnail_url = await uploadImage(thumbName, thumbBuffer, "asset");
        } else {
          throw new Error("Thumbnail must be image or video");
        }
      } else {
        
        thumbnail_url = existingAsset.thumbnail_url;
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
        file_url,
        thumbnail_url,
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
    const asset = await this.assetRepository.findOne({ where: { id } });
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
    // await deleteImageLocal(asset.thumbnail_url)
    await deleteImage(asset.thumbnail_url)
    await deleteImage(asset.file_url)
    await this.assetRepository.delete(id);

    } catch(error){
      throw new Error("Encountered Error while trying to delete asset")
    }
  }
}

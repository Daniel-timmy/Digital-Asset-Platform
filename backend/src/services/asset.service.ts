import { AppDataSource } from "../database/db";
import { Repository, In } from "typeorm";
import { Asset } from "../entities/asset.entities";
import { User } from "../entities/user.entities";
import { Category } from "../entities/category.entities";
import { Tag } from "../entities/tag.entities";
import { v4 as uuidv4} from 'uuid'
import { AuthRequest } from "interfaces/auth.interface";
import convertToWebP from "../utils/convertToWebP.utils";
import fs from "fs"
import path from "path"
import { HttpError } from "../error/HttpError";

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

    if (user.role !== "admin") throw new Error("User not an admin")

    const data = req.body
    const file = req?.file

    const category = data.category ? await this.categoryRepository.findOne({ where: { id: data.category } }) : null;
    if (!category) throw new Error("Category not found");

    if (!file) throw new Error("File not found")
    
    const tagsId = data.tagsId ? JSON.parse(data.tagsId) : null;
    const tag = data.tagsId ? await this.tagRepository.findBy({ id: In(tagsId) }) : null;
    if (!tag) throw new Error("Tag not found");
    const d = {
        name: data.name,
        description: data.description,
        price: data.price,
        file_url: data.file_url,
        user,
        category,
        tags:  tag
    }

    const asset = this.assetRepository.create(d);

    
    if (file) {
      
      // let filePath = null;
        // const uploadsDir = path.join(__dirname, '../../uploads/main');
        // if (!fs.existsSync(uploadsDir)) {
        //     fs.mkdirSync(uploadsDir, { recursive: true });
        // }
        // filePath = path.join(uploadsDir, fileName);
        // if (Buffer.isBuffer(file.buffer)) {
        //     fs.writeFileSync(filePath, file.buffer);
        // } else if (typeof file === 'string') {
        //     fs.writeFileSync(filePath, Buffer.from(file, 'base64'));
        // } else {
        //     throw new Error('Invalid file format');
        // }
        const thumbnailDir = path.join(__dirname, '../../uploads/thumbnail');
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }
        const thumbnail = await convertToWebP(file)

        const asset_name = uuidv4()

        const file_ext = file.originalname ? path.extname(file.originalname) : '';
        // const fileName = `${asset_name}${file_ext}`;


        const thumbnailName = `${asset_name}.webp`
        const thumbnailPath = path.join(thumbnailDir, thumbnailName);
        
        if (Buffer.isBuffer(thumbnail.buffer)) {
            fs.writeFileSync(thumbnailPath, thumbnail.buffer);
        } else if (typeof file === 'string') {
            fs.writeFileSync(thumbnailPath, Buffer.from(file, 'base64'));
        } else {
            throw new Error('Invalid file format');
        }


        // asset.file_url = filePath;
        asset.thumbnail_url = "/uploads/thumbnail/" + thumbnailName
    }
    const savedAsset = await this.assetRepository.save(asset);

    return savedAsset;
 }

  async findAll(): Promise<Asset[]> {
    return await this.assetRepository.find();
  }

  async findOne(id: string): Promise<Asset | null> {
    return await this.assetRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Asset>): Promise<Asset | null> {
    await this.assetRepository.update(id, data);
    return await this.assetRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    try {
    const asset = await this.assetRepository.findOne({ where: { id } });
    if (!asset) {
      throw new HttpError("Asset not found", 404)
    }
    fs.unlink(asset.file_url, (err) => {
      if (err) throw err;
      console.log(`${asset.file_url} was deleted`);
    });
     fs.unlink(asset.thumbnail_url, (err) => {
      if (err) throw err;
      console.log(`${asset.thumbnail_url} was deleted`);
    });
    await this.assetRepository.delete(id);

    } catch(error){
      throw new Error("Encountered Error while trying to delete asset")
    }
  }
}

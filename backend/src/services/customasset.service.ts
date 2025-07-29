import { AppDataSource } from "../database/db";
import { Repository, In } from "typeorm";
import { Asset } from "../entities/asset.entities";
import { CustomAsset } from "../entities/customasset.entities";
import { User } from "../entities/user.entities";
import { AuthRequest } from "interfaces/auth.interface";

interface ICustomAsset{
    name: string,
    description: string,
    user: any,
    asset?: any
}

export class CustomAssetService {
    private customAssetRepository: Repository<CustomAsset>
    private assetRepository: Repository<Asset>;
    private userRepository: Repository<User>;

      constructor() {
        this.assetRepository = AppDataSource.getRepository(Asset);
        this.customAssetRepository = AppDataSource.getRepository(CustomAsset);
        this.userRepository = AppDataSource.getRepository(User);
      }

    async create(req: AuthRequest){
      const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
      if (!user) throw new Error("Login to customize your assets");

      const asset = req.body ? await this.assetRepository.findOne({where: {id : req.body.asset }}) : null;
      if (!asset) throw new Error("Asset not found")
        
      const customAssetData : ICustomAsset = {
        name: req.body.name,
        description: req.body.description,
        asset: asset,
        user,
      }
      const customasset = this.customAssetRepository.create(customAssetData)
      return await this.customAssetRepository.save(customasset)

    }

    async findAll(): Promise<CustomAsset[]>{
        return await this.customAssetRepository.find()
    }

    async findOne(id: string): Promise<CustomAsset | null>{
        return await this.customAssetRepository.findOne({ where: { id }})
    }

    async update(id: string, data: Partial<CustomAsset>): Promise<CustomAsset | null>{
        await this.customAssetRepository.update(id, data)
        return await this.customAssetRepository.findOne({where: { id }})
    }

    async remove(id: string): Promise<void>{
      await this.customAssetRepository.delete(id)
    }
}
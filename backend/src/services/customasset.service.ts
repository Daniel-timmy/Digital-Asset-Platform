import { AppDataSource } from "../database/db";
import { Repository, In } from "typeorm";
import { Asset } from "../entities/asset.entities";
import { User } from "../entities/user.entities";
import { CustomAsset } from "../entities/customasset.entities";
import { applyCustomAssetFilters } from "../filters/customassets.filter";
import { AuthRequest } from "interfaces/auth.interface";
import logger from "../logger/app.logger";
import { HttpError } from "../error/HttpError";
import { IFitltered } from "../interfaces/asset.interface";
import sendEmail from "../utils/sendEmail";


interface ICustomAsset{
    name: string,
    description: string,
    user: User,
    asset?: Asset,
    type?: "custom" | "download",
    status?: "open" | "closed",
}

export class CustomAssetService {
    private customAssetRepository: Repository<CustomAsset>
    private assetRepository: Repository<Asset>;

      constructor() {
        this.assetRepository = AppDataSource.getRepository(Asset);
        this.customAssetRepository = AppDataSource.getRepository(CustomAsset);
      }

    async create(req: AuthRequest){
      const user = req.user
      if (!user) throw new Error("Unauthorized")

      const asset = req.body ? await this.assetRepository.findOne({where: {id : req.body.asset }}) : null;
      if (!asset) throw new Error("Asset not found")
              
      const customAssetData : ICustomAsset = {
        name: req.body.name,
        description: req.body.description,
        asset: asset,
        type: req.body.type,
        status: req.body.type === "download" ? "closed" : "open",
        user,
      }
      const customasset = this.customAssetRepository.create(customAssetData)
      return await this.customAssetRepository.save(customasset)

    }

    async getCustomAssetPaymentStatusCounts(req: AuthRequest) {
      const user = req.user;
      if (!user) throw new Error("Unauthenticated user")
      const counts = await this.customAssetRepository
        .createQueryBuilder("customAsset")
        .select("customAsset.payment_status, COUNT(*) as count")
        .where("customAsset.user_id = :userId", { userId: user.id })
        .groupBy("customAsset.payment_status")
        .getRawMany();
      
      const completedCount = await this.customAssetRepository
        .createQueryBuilder("customAsset")
        .select("customAsset.status, COUNT(*) as count")
        .where("customAsset.user_id = :userId", { userId: user.id })
        .groupBy("customAsset.status")
        .getRawMany();

      const result = {
        paid: 0,
        pending: 0,
        processing: 0
      };
      const completedResult = {
        open: 0,
        closed: 0,
        cancelled: 0
      };
      completedCount.forEach((item: { status: string; count: string }) => {
        completedResult[item.status as keyof typeof completedResult] = parseInt(item.count);})
    
      counts.forEach((item: { payment_status: string; count: string }) => {
        result[item.payment_status as keyof typeof result] = parseInt(item.count);
      });

      const countresult = { ...result, ...completedResult }
      return countresult;
    }

    async findAll(req: AuthRequest): Promise<IFitltered> {

      const filters = req.query;

      if (req.user && req.user.role !== 'admin') {
          filters.user = { id: req.user.id };
          logger.debug(`Applying user filter for non-admin user: ${req.user.id}`);
      }
      
      const query = this.customAssetRepository
          .createQueryBuilder("customAsset")
          .leftJoinAndSelect("customAsset.user", "user")
          .leftJoinAndSelect("customAsset.asset", "asset");
          
      return await applyCustomAssetFilters(query, filters);
    }

    async findOne(req: AuthRequest, id: string): Promise<CustomAsset | null>{
        const user = req.user;
        if (!user) throw new Error("User not unauthenticated")
        if (user.role === "admin"){
          
          return await this.customAssetRepository.findOne({where: { id }});
        }
        return await this.customAssetRepository.findOneBy({ id, user: { id: user.id } });
    }

async update(id: string, data: Partial<CustomAsset>): Promise<CustomAsset | null> {
    const result = await this.customAssetRepository.update(id, data);

    const updatedEntity = await this.customAssetRepository.findOne({ where: { id }, relations: ["user", "asset"], });
    if (updatedEntity && updatedEntity.type === 'custom'){
            await sendEmail(
               updatedEntity.user.id,
               "Your customisation request is done!!!",
               `Here is the link to download your custom request: ${updatedEntity.custom_url}`
            );
        }

    return updatedEntity;
}



    async remove(id: string, req: AuthRequest): Promise<void>{
        const user = req.user
        if (!user) throw new Error("Unauthorized")
          
        const asset = await this.customAssetRepository.findOne({
          where: { id },
          relations: ["user"],
        });
  
        if (!asset) {
          logger.warn(`Custom asset not found for ID: ${id}`);
        throw new HttpError("Asset not found", 404);
      }
        const isOwner = asset.user.id === user.id;
        const isAdmin = user.role === "admin";


        if (!isOwner && !isAdmin) {
          throw new Error("You are not authorized to delete this asset");
        }
      
        await this.customAssetRepository.delete(id);
    }

    async countActiveRequests(): Promise<number> {
      try {
        logger.info(`Fetching count of open custom requests`);
        const count = await this.customAssetRepository.count({ where: { status: "open" } });
        logger.info(`Successfully retrieved open custom requests count: ${count}`);
        return count;
      } catch (error) {
        logger.error(`Error fetching open custom requests count: ${error}`);
        throw new HttpError("Failed to fetch open custom requests count", 500);
      }
  }
}
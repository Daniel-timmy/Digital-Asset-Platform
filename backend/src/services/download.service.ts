import { AppDataSource } from "../database/db";
import { Repository, In } from "typeorm";
import { Download } from "../entities/download.entities";
import { Asset } from "../entities/asset.entities";
import { AuthRequest } from "../interfaces/auth.interface";
import { User } from "../entities/user.entities";
import { CustomAsset } from "../entities/customasset.entities";

export class DownloadService {
  private downloadRepository: Repository<Download>;
  private assetRepository: Repository<Asset>;

  constructor() {
    this.downloadRepository = AppDataSource.getRepository(Download);
    this.assetRepository = AppDataSource.getRepository(Asset);
  }

  async create(req: AuthRequest) {

    const user = req.user
    if (!user) throw new Error("User not found");

    const { asset_id } = req.body

    const asset = asset_id ? await this.assetRepository.findOne({ where: { id: asset_id } }) : null;
    if (!asset) throw new Error("Asset not found");

    const download = this.downloadRepository.create({
      user,
      asset
    });
    return await this.downloadRepository.save(download);
  }

  async batchCreate(asset_ids: Array<string>, custom_asset: CustomAsset, user?: User ) {
    
      console.log(asset_ids)
      if (!Array.isArray(asset_ids) || asset_ids.length === 0) {
        throw new Error("Asset IDs must be a non-empty array");
      }
    
      // Find all assets in one query
      const assets = await this.assetRepository.find({
        where: { id: In(asset_ids) },
      });
    
      // Verify all requested assets were found
      if (assets.length !== asset_ids.length) {
        throw new Error("One or more assets not found");
      }
    
      // Create download entities
      const downloads = assets.map(asset =>
        this.downloadRepository.create({
          user,
          asset,
          custom_asset,
        })
      );
    
      // Save all downloads in one transaction
      return await this.downloadRepository.save(downloads);
  }

  async findAll(req: AuthRequest): Promise<Download[]> {
    const user = req.user;
    if (!user) throw new Error("User not unauthenticated")

    if (user.role === "admin") {
      return await this.downloadRepository.find({ where: { user: { id: user.id } }, relations: ['asset', ] });

      }
      return await this.downloadRepository.find({ where: { user: { id: user.id } }, relations: ['asset', ] });
  }

  async findOne(id: string): Promise<Download | null> {
    return await this.downloadRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Download>): Promise<Download | null> {
    await this.downloadRepository.update(id, data);
    return await this.downloadRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.downloadRepository.delete(id);
  }
}

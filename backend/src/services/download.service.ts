import { AppDataSource } from "../database/db";
import { Repository, In } from "typeorm";
import { Download } from "../entities/download.entities";
import { Asset } from "../entities/asset.entities";
import { AuthRequest } from "../interfaces/auth.interface";
import { User } from "../entities/user.entities";
import { CustomAsset } from "../entities/customasset.entities";
import { applyDownloadFilters } from "../filters/download.filter";
import { IFitltered } from "../interfaces/asset.interface";
import { Transaction } from "../entities/transaction.entities";

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
      asset,
      price: asset.price,
      creator: asset.user,
      transaction: req.body.transaction
    });
    return await this.downloadRepository.save(download);
  }

  async batchCreate(asset_ids: Array<string>, transaction: Transaction, user?: User ) {
    
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
          transaction,
          creator: asset.user,
          price: asset.price
        })
      );
    
      // Save all downloads in one transaction
      return await this.downloadRepository.save(downloads);
  }

  async findAll(req: AuthRequest): Promise<IFitltered> {
    const user = req.user;
    if (!user) throw new Error("User not authenticated");

    const {
      page,
      limit,
      orderBy,
      orderDirection,
      startDate,
      endDate,
      asset_id,
      creator
    } = req.query;

    let query = this.downloadRepository
      .createQueryBuilder("download")
      .leftJoinAndSelect("download.asset", "asset")
      .leftJoinAndSelect("download.user", "user");

    const filters = {
      user: user.role === "admin" ? undefined : user,

      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      creator: creator ? { id: creator as string } : undefined,
      orderBy: orderBy as string | undefined,
      orderDirection: (orderDirection as string)?.toUpperCase() as 'ASC' | 'DESC' | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      asset: asset_id ? { id: asset_id as string } : undefined,
    };

    return await applyDownloadFilters(query, filters);
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

  async getCount(creatorId: string): Promise<number> {
    return await this.downloadRepository.count({
      where: {
        creator: { id: creatorId }
      }
    });
  }
}

import { AppDataSource } from "../database/db";
import { Repository, In } from "typeorm";
import { Download } from "../models/download.entities";
import { Asset } from "../models/asset.entities";
import { AuthRequest } from "../interfaces/auth.interface";
import { User } from "../models/user.entities";
import { applyDownloadFilters } from "../filters/download.filter";
import { IFitltered } from "../interfaces/asset.interface";
import { Transaction } from "../models/transaction.entities";
import { License } from "../models/license.entities";


interface AssetWithLicense extends Asset {
  asset_license?: License;
}

export class DownloadService {
  private downloadRepository: Repository<Download>;
  private assetRepository: Repository<Asset>;
  private licenseRepository: Repository<License>;

  constructor() {
    this.downloadRepository = AppDataSource.getRepository(Download);
    this.assetRepository = AppDataSource.getRepository(Asset);
    this.licenseRepository = AppDataSource.getRepository(License);
  }

  async create(req: AuthRequest) {

    const user = req.user
    if (!user) throw new Error("User not found");

    const { asset_id } = req.body

    const result = await this.assetRepository.createQueryBuilder('asset')
      .leftJoinAndSelect('licenses', 'asset_license', 'license.asset_id = asset.id')
      .where('asset.id = :asset_id', { asset_id })
      .getOne();
    if (!result) throw new Error("Asset not found");
    const asset: AssetWithLicense = result as AssetWithLicense;

    const download = this.downloadRepository.create({
      user,
      asset,
      license: asset.asset_license,
      price: asset.price,
      creator: asset.user,
      transaction: req.body.transaction
    });
    return await this.downloadRepository.save(download);
  }

  async batchCreate(asset_ids: Array<string>, transaction: Transaction, user?: User) {

    console.log(asset_ids)
    if (!Array.isArray(asset_ids) || asset_ids.length === 0) {
      throw new Error("Asset IDs must be a non-empty array");
    }

    // Find all assets in one query
    const assets = await this.assetRepository
      .createQueryBuilder('asset')
      .select(['asset', 'user.id'])
      .leftJoin('asset.user', 'user')
      .where('asset.id IN (:...asset_ids)', { asset_ids })
      .getMany();
    // Verify all requested assets were found
    if (assets.length !== asset_ids.length) {
      throw new Error("One or more assets not found");
    }
    const licenses = await this.licenseRepository.find({
      where: { asset: In(asset_ids) }, relations: ["asset"]
    });
    const licenseMap: Record<string, License> = {};
    licenses.forEach(license => {
      licenseMap[license.asset.id] = license;
    });

    // Create download entities
    const downloads = assets.map(asset =>
    (console.log("Creating download for asset inside map:", asset),
      this.downloadRepository.create({
        user,
        asset,
        transaction,
        license: licenseMap ? licenseMap[asset.id] : undefined,
        creator: asset.user,
        price: asset.price
      }))
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
      .leftJoinAndSelect("download.license", "license")
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

  async getTotalSales(creatorId: string): Promise<{ total: number }> {
    const res = await this.downloadRepository.find({
      where: {
        creator: { id: creatorId }
      }
    });
    const result = await this.downloadRepository
      .createQueryBuilder('download')
      .select('SUM(download.price)', 'total')  // ✅ Single string with alias
      .where('download.creator = :creatorId', { creatorId })
      .getRawOne();

    return {
      total: parseFloat(result.total) || 0,
    };
  }
}

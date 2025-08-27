import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { Download } from "../entities/download.entities";
import { Asset } from "../entities/asset.entities";
import { AuthRequest } from "../interfaces/auth.interface";

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

  async findAll(req: AuthRequest): Promise<Download[]> {
    const user = req.user;
    if (!user) throw new Error("User not unauthenticated")

    if (user.role === "admin") {
      return await this.downloadRepository.find();

      }
      return await this.downloadRepository.find({ where: { user: { id: user.id } }, relations: ['asset'] });
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

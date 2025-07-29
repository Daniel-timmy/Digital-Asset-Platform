import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { Download } from "../entities/download.entities";
import { User } from "../entities/user.entities";
import { Asset } from "../entities/asset.entities";

export class DownloadService {
  private downloadRepository: Repository<Download>;
  private userRepository: Repository<User>;
  private assetRepository: Repository<Asset>;

  constructor() {
    this.downloadRepository = AppDataSource.getRepository(Download);
    this.userRepository = AppDataSource.getRepository(User);
    this.assetRepository = AppDataSource.getRepository(Asset);
  }

  async create(data: any) {
    const user = data.user_id ? await this.userRepository.findOne({ where: { id: data.user_id } }) : null;
    if (!user) throw new Error("User not found");

    const asset = data.asset_id ? await this.assetRepository.findOne({ where: { id: data.asset_id } }) : null;
    if (!asset) throw new Error("Asset not found");

    const download = this.downloadRepository.create({
      user,
      asset
    });
    return await this.downloadRepository.save(download);
  }

  async findAll(): Promise<Download[]> {
    return await this.downloadRepository.find();
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

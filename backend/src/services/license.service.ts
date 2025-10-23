import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { License } from "../entities/license.entities";

export class LicenseService {
  private licenseRepository: Repository<License>;

  constructor() {
    this.licenseRepository = AppDataSource.getRepository(License);
  }

  async create(data: Partial<License>) {
    const license = this.licenseRepository.create(data);
    return await this.licenseRepository.save(license);
  }

  async findAll(): Promise<License[]> {
    return await this.licenseRepository.find();
  }

  async findOne(id: string): Promise<License | null> {
    return await this.licenseRepository.findOne({ where: { id } });
  }
  async findOneByAsset(id: string): Promise<License | null> {
  return await this.licenseRepository.findOne({
    where: { asset: { id } }, 
  });
}

  async update(id: string, data: Partial<License>): Promise<License | null> {
    await this.licenseRepository.update(id, data);
    return await this.licenseRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.licenseRepository.delete(id);
  }
}

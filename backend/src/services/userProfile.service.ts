import { UserProfile } from "../entities/userProfile.entities";
import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";

export class UserProfileService {
  private userProfileRepository: Repository<UserProfile>;

  constructor(){
    this.userProfileRepository = AppDataSource.getRepository(UserProfile)
  }

  async create(data: Partial<UserProfile>) {
    const profile = this.userProfileRepository.create(data);
    return await this.userProfileRepository.save(profile);
  }

  async getById(id: string) {
    return await this.userProfileRepository.findOne({where: { id }, relations: ["user"] });
  }

  async update(id: string, data: Partial<UserProfile>) {
    await this.userProfileRepository.update(id, data);
    return await this.getById(id);
  }

  async delete(id: string) {
    await this.userProfileRepository.delete(id);
  }
}

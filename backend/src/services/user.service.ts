import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { User } from "../entities/user.entities";
import logger from "../logger/app.logger";
import { HttpError } from "../error/HttpError";

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(data: Partial<User>) {
    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, data);
    return await this.userRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
  
  async countActiveUsers(): Promise<number> {
    try {
      logger.info(`Fetching count of active users`);
      const count = await this.userRepository.count({ where: { status: "active" } });
      logger.info(`Successfully retrieved active user count: ${count}`);
      return count;
    } catch (error) {
      logger.error(`Error fetching active user count: ${error}`);
      throw new HttpError("Failed to fetch active user count", 500);
    }
  }
}

import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { Tag } from "../models/tag.entities";

export class TagService {
  private tagRepository: Repository<Tag>;

  constructor() {
    this.tagRepository = AppDataSource.getRepository(Tag);
  }

  async create(data: Partial<Tag>) {
    const tag = this.tagRepository.create(data);
    return await this.tagRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return await this.tagRepository.find();
  }

  async findOne(id: string): Promise<Tag | null> {
    return await this.tagRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Tag>): Promise<Tag | null> {
    await this.tagRepository.update(id, data);
    return await this.tagRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.tagRepository.delete(id);
  }
}

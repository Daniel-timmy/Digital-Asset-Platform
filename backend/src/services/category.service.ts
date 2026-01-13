import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { Category } from "../models/category.entities";

export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  async create(data: Partial<Category>): Promise<Category> {
    const category = this.categoryRepository.create(data);
    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findOne(id: string): Promise<Category | null> {
    return await this.categoryRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    await this.categoryRepository.update(id, data);
    return await this.categoryRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}

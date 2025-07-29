import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { Transaction } from "../entities/transaction.entities";
import { User } from "../entities/user.entities";
import { Asset } from "../entities/asset.entities";

export class TransactionService {
  private transactionRepository: Repository<Transaction>;
  private userRepository: Repository<User>;
  private assetRepository: Repository<Asset>;

  constructor() {
    this.transactionRepository = AppDataSource.getRepository(Transaction);
    this.userRepository = AppDataSource.getRepository(User);
    this.assetRepository = AppDataSource.getRepository(Asset);
  }

  async create(data: any) {
    // const user = data.user ? await this.userRepository.findOne({ where: { id: data.user } }) : null;
    // if (!user) throw new Error("User not found");

    // const asset = data.asset ? await this.assetRepository.findOne({ where: { id: data.asset } }) : null;
    // if (!asset) throw new Error("Asset not found");

    const transaction = this.transactionRepository.create({
      ...data,
    
    });
    return await this.transactionRepository.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepository.find();
  }

  async findOne(id: string): Promise<Transaction | null> {
    return await this.transactionRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction | null> {
    await this.transactionRepository.update(id, data);
    return await this.transactionRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.transactionRepository.delete(id);
  }
}

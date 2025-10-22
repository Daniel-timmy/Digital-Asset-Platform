import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { Transaction } from "../entities/transaction.entities";
import logger from "../logger/app.logger";
import { HttpError } from "../error/HttpError";

export class TransactionService {
  private transactionRepository: Repository<Transaction>;


  constructor() {
    this.transactionRepository = AppDataSource.getRepository(Transaction);
   
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
    return await this.transactionRepository.createQueryBuilder("transaction")
      .where("transaction.id = :id", { id })
      .getOne();
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction | null> {
    await this.transactionRepository.update(id, data);
    return await this.transactionRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.transactionRepository.delete(id);
  }

  async getTotalSales(): Promise<number> {
    try {
      logger.info(`Fetching total sales amount for completed transactions`);

      const result = await this.transactionRepository
        .createQueryBuilder("transaction")
        .select("SUM(transaction.amount)", "total")
        .where("transaction.payment_status = :status", { status: "completed" })
        .getRawOne();

      const total = result && result.total ? parseFloat(result.total) : 0;
      logger.info(`Successfully retrieved total sales amount: ${total}`);
      return total;
    } catch (error) {
      logger.error(`Error fetching total sales amount: ${error}`);
      throw new HttpError("Failed to fetch total sales amount", 500);
    }
  }
}

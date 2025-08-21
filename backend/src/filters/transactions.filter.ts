import { IFitltered } from "../interfaces/asset.interface";

interface TransactionFilter {
  userId?: string;
  cId?: number;
  amountMin?: number;
  amountMax?: number;
  status?: string;
  page?: number; // Add page number for pagination
  limit?: number;
}

export async function applyTransactionsFilters(query: any, filter: TransactionFilter): Promise<IFitltered> {

    if (filter.amountMin !== undefined) {
        query = query.andWhere("transaction.amount >= :amountMin", { amountMin: filter.amountMin });
    }

    if (filter.amountMax !== undefined) {
        query = query.andWhere("transaction.amount <= :amountMax", { amountMax: filter.amountMax });
    }
    if (filter.status) {
        query = query.andWhere("transaction.payment_status = :status", { status: filter.status });
    }
    if (filter.cId) {
        query = query.andWhere("transaction.custom_asset = :cId", { cId: filter.cId });
    }

    const page = filter.page ?? 1; 
    const limit = filter.limit ?? 10; 
    const skip = (page - 1) * limit;

    query = query.skip(skip).take(limit);
    const [results, total] = await query.getManyAndCount();
    return {
        results,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };

}
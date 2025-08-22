// First, update the AssetFilter interface to include pagination parameters
interface AssetFilter {
  userId?: string;
  name?: string;
  fileType?: string;
  categoryId?: number;
  priceMin?: number;
  priceMax?: number;
  status?: string;
  tagIds?: number[];
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
  page?: number; // Add page number for pagination
  limit?: number; // Add items per page limit
}

export async function applyAssetFilters(query: any, filter: AssetFilter) {
    // Apply existing filters
    if (filter.userId) {
        query = query.andWhere("asset.user_id = :userId", { userId: filter.userId });
    }

    if (filter.name) {
        query = query.andWhere("asset.name ILIKE :name", { name: `%${filter.name}%` });
    }

    if (filter.fileType) {
        query = query.andWhere("asset.file_type = :fileType", { fileType: filter.fileType });
    }

    if (filter.categoryId) {
        query = query.andWhere("asset.category = :categoryId", { categoryId: filter.categoryId });
    }

    if (filter.priceMin !== undefined) {
        query = query.andWhere("asset.price >= :priceMin", { priceMin: filter.priceMin });
    }

    if (filter.priceMax !== undefined) {
        query = query.andWhere("asset.price <= :priceMax", { priceMax: filter.priceMax });
    }

    if (filter.status) {
        query = query.andWhere("asset.status = :status", { status: filter.status });
    }

    if (filter.tagIds && filter.tagIds.length > 0) {
        // Ensure tagIds is always treated as an array
        const tagIds = Array.isArray(filter.tagIds) ? filter.tagIds : [filter.tagIds];
        query = query
            .innerJoin("asset.tags", "tag")
            .andWhere("tag.id IN (:...tagIds)", { tagIds });
    }

    if (filter.createdAfter) {
        query = query.andWhere("asset.created_at >= :createdAfter", { createdAfter: filter.createdAfter });
    }

    if (filter.createdBefore) {
        query = query.andWhere("asset.created_at <= :createdBefore", { createdBefore: filter.createdBefore });
    }
    

    if (filter.search) {
        query = query.andWhere(
            "(asset.name ILIKE :search OR asset.description ILIKE :search)",
            { search: `%${filter.search}%` }
        );
    }

    const page = filter.page ?? 1; 
    const limit = filter.limit ?? 10; 
    const skip = (page - 1) * limit;

    query = query.skip(skip).take(limit);

    // Return both results and total count for pagination metadata
    const [results, total] = await query.getManyAndCount();

    return {
        results,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}

// export class AssetFilterService {
//   constructor(private assetRepository: Repository<Asset>) {}

//   async filterAssets(filter: AssetFilter): Promise<Asset[]> {
//     let queryBuilder: SelectQueryBuilder<Asset> = this.assetRepository
//       .createQueryBuilder("asset")
//       .leftJoinAndSelect("asset.user", "user")
//       .leftJoinAndSelect("asset.category", "category")
//       .leftJoinAndSelect("asset.tags", "tags");

//     // Apply filters

//   }

//   // Optional: Add pagination
//   async filterAssetsWithPagination(
//     filter: AssetFilter,
//     page: number = 1,
//     limit: number = 10
//   ): Promise<{
//     assets: Asset[];
//     total: number;
//     page: number;
//     limit: number;
//   }> {
//     let queryBuilder: SelectQueryBuilder<Asset> = this.assetRepository
//       .createQueryBuilder("asset")
//       .leftJoinAndSelect("asset.user", "user")
//       .leftJoinAndSelect("asset.category", "category")
//       .leftJoinAndSelect("asset.tags", "tags");

//     // Apply filters (same as above)
//     if (filter.userId) {
//       queryBuilder = queryBuilder.andWhere("asset.user_id = :userId", { userId: filter.userId });
//     }
//     // ... apply other filters similarly ...

//     // Add pagination
//     queryBuilder = queryBuilder
//       .skip((page - 1) * limit)
//       .take(limit);

//     // Get results and total count
//     const [assets, total] = await queryBuilder.getManyAndCount();

//     return {
//       assets,
//       total,
//       page,
//       limit
//     };
//   }
// }
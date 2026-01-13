import { CustomAsset } from "../models/customasset.entities";
import { IFitltered } from "../interfaces/asset.interface";

interface ICustomAsset {
    name?: string;
    description?: string;
    user?: any;
    asset?: any;
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    type?: string;
}



export async function applyCustomAssetFilters(query: any, filter: ICustomAsset): Promise<IFitltered> {
    // Apply existing filters
    if (filter.name) {
        query = query.andWhere("customAsset.name ILIKE :name", { name: `%${filter.name}%` });
    }

    if (filter.description) {
        query = query.andWhere("customAsset.description ILIKE :description", { description: `%${filter.description}%` });
    }

    if (filter.user) {
        query = query.andWhere("customAsset.user_id = :userId", { userId: filter.user.id });
    }

    if (filter.asset) {
        query = query.andWhere("customAsset.asset_id = :assetId", { assetId: filter.asset.id });
    }

    if (filter.type) {
        query = query.andWhere("customAsset.type = :type", { type: filter.type })
    }

    // Order by
    if (filter.orderBy) {
        const direction = filter.orderDirection || 'ASC';
        query = query.orderBy(`customAsset.${filter.orderBy}`, direction);
    } else {
        query = query.orderBy('customAsset.created_at', 'DESC');
    }

    // Pagination
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    query = query.skip((page - 1) * limit).take(limit);

    const [results, total] = await query.getManyAndCount();
    return {
        results,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };

}
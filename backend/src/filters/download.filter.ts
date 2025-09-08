import { IFitltered } from "../interfaces/asset.interface";
import { User } from "../entities/user.entities";

interface IDownload {
    user?: User;
    asset?: any;
    custom_asset?: any;
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    startDate?: Date;
    endDate?: Date;
}

export async function applyDownloadFilters(query: any, filter: IDownload): Promise<IFitltered> {
    // Apply filters
    if (filter.user) {
        query = query.andWhere("download.user_id = :userId", { userId: filter.user.id });
    }

    if (filter.asset) {
        query = query.andWhere("download.asset_id = :assetId", { assetId: filter.asset });
    }

    if (filter.custom_asset) {
        query = query.andWhere("download.custom_asset_id = :customAssetId", { customAssetId: filter.custom_asset });
    }

    // Date range filters
    if (filter.startDate) {
        query = query.andWhere("download.downloaded_at >= :startDate", { startDate: filter.startDate });
    }

    if (filter.endDate) {
        query = query.andWhere("download.downloaded_at <= :endDate", { endDate: filter.endDate });
    }

    // Order by
    if (filter.orderBy) {
        const direction = filter.orderDirection || 'ASC';
        query = query.orderBy(`download.${filter.orderBy}`, direction);
    } else {
        query = query.orderBy('download.downloaded_at', 'DESC');
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

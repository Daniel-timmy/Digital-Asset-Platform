import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { Download } from "../models/download.entities";
import { Asset } from "../models/asset.entities";
import { CustomAsset } from "../models/customasset.entities";
import { HttpError } from "../error/HttpError";

export class AnalyticsService {
    private downloadRepository: Repository<Download>;
    private assetRepository: Repository<Asset>;
    private customAssetRepository: Repository<CustomAsset>;

    constructor() {
        this.downloadRepository = AppDataSource.getRepository(Download);
        this.assetRepository = AppDataSource.getRepository(Asset);
        this.customAssetRepository = AppDataSource.getRepository(CustomAsset);
    }

    async getDashboardStats(creatorId: string) {
        const downloadRevenue = await this.downloadRepository
            .createQueryBuilder("download")
            .select("SUM(download.price)", "total")
            .where("download.creator_id = :creatorId", { creatorId })
            .getRawOne();

        const customAssetRevenue = await this.customAssetRepository
            .createQueryBuilder("customAsset")
            .select("SUM(customAsset.price)", "total")
            .innerJoin("customAsset.asset", "asset")
            .where("asset.user_id = :creatorId", { creatorId })
            .andWhere("customAsset.payment_status = :status", { status: "paid" })
            .getRawOne();

        const totalRevenue =
            parseFloat(downloadRevenue?.total || "0") +
            parseFloat(customAssetRevenue?.total || "0");

        const totalSales = await this.downloadRepository.count({
            where: { creator: { id: creatorId } },
        });

        const totalProducts = await this.assetRepository.count({
            where: { user: { id: creatorId }, status: "approved" },
        });

        const activeCustomers = await this.downloadRepository
            .createQueryBuilder("download")
            .select("COUNT(DISTINCT download.user_id)", "count")
            .where("download.creator_id = :creatorId", { creatorId })
            .getRawOne();

        return {
            totalRevenue: totalRevenue.toFixed(2),
            totalSales,
            totalProducts,
            activeCustomers: parseInt(activeCustomers?.count || "0"),
        };
    }

    async getRevenueChart(creatorId: string, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const chartData = await this.downloadRepository
            .createQueryBuilder("download")
            .select("DATE(download.created_at)", "date")
            .addSelect("SUM(download.price)", "revenue")
            .addSelect("COUNT(download.id)", "sales")
            .where("download.creator_id = :creatorId", { creatorId })
            .andWhere("download.created_at >= :startDate", { startDate })
            .groupBy("DATE(download.created_at)")
            .orderBy("DATE(download.created_at)", "ASC")
            .getRawMany();

        return chartData.map((item) => ({
            date: item.date,
            revenue: parseFloat(item.revenue || "0"),
            sales: parseInt(item.sales || "0"),
        }));
    }

    async getRecentSales(creatorId: string, limit: number = 10) {
        const recentSales = await this.downloadRepository.find({
            where: { creator: { id: creatorId } },
            relations: ["user", "asset"],
            order: { created_at: "DESC" },
            take: limit,
        });

        return recentSales.map((download) => ({
            id: download.id,
            assetName: download.asset?.name || "Unknown",
            buyer: download.user?.name || "Unknown",
            price: parseFloat(download.price.toString()),
            date: download.created_at,
        }));
    }

    async getTopProducts(creatorId: string, limit: number = 5) {
        const topProducts = await this.downloadRepository
            .createQueryBuilder("download")
            .select("asset.id", "assetId")
            .addSelect("asset.name", "assetName")
            .addSelect("COUNT(download.id)", "downloadCount")
            .addSelect("SUM(download.price)", "totalRevenue")
            .innerJoin("download.asset", "asset")
            .where("download.creator_id = :creatorId", { creatorId })
            .groupBy("asset.id")
            .addGroupBy("asset.name")
            .orderBy("COUNT(download.id)", "DESC")
            .limit(limit)
            .getRawMany();

        return topProducts.map((product) => ({
            assetId: product.assetId,
            assetName: product.assetName,
            downloadCount: parseInt(product.downloadCount || "0"),
            totalRevenue: parseFloat(product.totalRevenue || "0"),
        }));
    }
}

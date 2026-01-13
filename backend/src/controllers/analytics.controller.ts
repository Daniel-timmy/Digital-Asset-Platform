import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { HttpError } from "../error/HttpError";

export class AnalyticsController {
    private analyticsService: AnalyticsService;

    constructor(analyticsService: AnalyticsService) {
        this.analyticsService = analyticsService;
    }

    async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new HttpError("Unauthorized", 401);
            }

            const creatorId = req.user.id;
            const stats = await this.analyticsService.getDashboardStats(creatorId);
            const chartData = await this.analyticsService.getRevenueChart(creatorId, 30);
            const recentSales = await this.analyticsService.getRecentSales(creatorId, 10);

            res.status(200).json({
                stats,
                chartData,
                recentSales,
            });
        } catch (error) {
            next(error);
        }
    }

    async getChart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new HttpError("Unauthorized", 401);
            }

            const creatorId = req.user.id;
            const days = parseInt(req.query.days as string) || 30;
            const chartData = await this.analyticsService.getRevenueChart(creatorId, days);

            res.status(200).json({ chartData });
        } catch (error) {
            next(error);
        }
    }

    async getTopProducts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new HttpError("Unauthorized", 401);
            }

            const creatorId = req.user.id;
            const limit = parseInt(req.query.limit as string) || 5;
            const topProducts = await this.analyticsService.getTopProducts(creatorId, limit);

            res.status(200).json({ topProducts });
        } catch (error) {
            next(error);
        }
    }
}

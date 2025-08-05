import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../interfaces/auth.interface";
import { AppDataSource } from "../database/db";
import { CustomAsset } from "../entities/customasset.entities";
import { CustomAssetService } from "../services/customasset.service";
import { applyCustomAssetFilters } from "../filters/customassets.filter";

export class CustomAssetController {
    constructor(private customAssetService: CustomAssetService) {}

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const customAsset = await this.customAssetService.create(req);
            res.status(201).json(customAsset);
        } catch (error) {
            next(error);
        }
    }

    async findAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const filters = req.query;
            const userId = req.user?.id;
            const userRole = req.user?.role;
            // Only filter by user if not admin
            if (userId && userRole !== 'admin') {
                filters.user = { id: userId }; // Add user filter if user is not admin
            }
            const query = AppDataSource.getRepository(CustomAsset)
                .createQueryBuilder("customAsset")
                .leftJoinAndSelect("customAsset.user", "user")
                .leftJoinAndSelect("customAsset.asset", "asset");
            
            const filteredAssets = await applyCustomAssetFilters(query, filters);
            
            res.status(200).json(filteredAssets);
        } catch (error) {
            next(error);
        }
    }


    async getCountByPaymentStatus(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const customAssetsCounts = await this.customAssetService.getCustomAssetPaymentStatusCounts(req);
            res.status(200).json(customAssetsCounts)
        } catch(error){
            next(error);
        }
    }

    async findById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const customAsset = await this.customAssetService.findOne(req, id);
            if (!customAsset) {
                return res.status(404).json({ error: "Custom asset not found" });
            }
            res.status(200).json(customAsset);
        } catch (error) {
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const customAsset = await this.customAssetService.update(id, req);
            if (!customAsset) {
                return res.status(404).json({ error: "Custom asset not found" });
            }
            res.status(200).json(customAsset);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const result = await this.customAssetService.remove(id, req);
          
            res.status(204).send(); // No content for successful deletion
        } catch (error) {
            next(error);
        }
    }
}
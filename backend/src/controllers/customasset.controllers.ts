import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "interfaces/auth.interface";

import { CustomAssetService } from "../services/customasset.service";

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

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const customAssets = await this.customAssetService.findAll();
            res.status(200).json(customAssets);
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const customAsset = await this.customAssetService.findOne(id);
            if (!customAsset) {
                return res.status(404).json({ error: "Custom asset not found" });
            }
            res.status(200).json(customAsset);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const customAsset = await this.customAssetService.update(id, req.body);
            if (!customAsset) {
                return res.status(404).json({ error: "Custom asset not found" });
            }
            res.status(200).json(customAsset);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const result = await this.customAssetService.remove(id);
          
            res.status(204).send(); // No content for successful deletion
        } catch (error) {
            next(error);
        }
    }
}
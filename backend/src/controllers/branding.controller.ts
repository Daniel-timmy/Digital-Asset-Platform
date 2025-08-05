import { NextFunction, Request, Response } from "express";
import { BrandingService } from "../services/branding.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { AppDataSource } from "../database/db";
import { HttpError } from "../error/HttpError";
import { Branding } from "../entities/branding.entities";

export class BrandingController {
    constructor(private brandingService: BrandingService) {}

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const branding = await this.brandingService.create(req);
            res.status(201).json(branding);
        } catch (error) {
            next(error);
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const brandings = await this.brandingService.findAll();
            res.status(200).json(brandings);
        } catch (error) {
            next(error);
        }
    }

    async findByUserId(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new HttpError("User not authenticated", 401);
            const brandings = await this.brandingService.findByUserId(req.user.id);
            res.status(200).json(brandings);
        } catch (error) {
            next(error);
        }
    }

    async findOne(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const branding = await this.brandingService.findById(req.params.id, req );
            if (!branding) return res.status(404).json({ error: "Branding not found" });
            res.status(200).json(branding);
        } catch (error) {
            next(error);
        }
    }
    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const branding = await this.brandingService.findById(req.params.id, req as AuthRequest);
            if (!branding) return res.status(404).json({ error: "Branding not found" });
            
            const updatedBranding = await this.brandingService.update(req.params.id, req);
            res.status(200).json(updatedBranding);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const branding = await this.brandingService.findById(req.params.id, req as AuthRequest);
            if (!branding) return res.status(404).json({ error: "Branding not found" });
            
            await this.brandingService.delete(req.params.id, req);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
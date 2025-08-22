import { NextFunction, Request, Response } from "express";
import { PhotographyService } from "../services/photography.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { AppDataSource } from "../database/db";
import { Photography } from "../entities/photography.entities";


export class PhotographyController {
    constructor(private photographyService: PhotographyService) {}

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const photography = await this.photographyService.create(req);
            res.status(201).json(photography);
        } catch (error) {
            next(error);
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const photographs = await this.photographyService.findAll();
            res.status(200).json(photographs);
        } catch (error) {
            next(error);
        }
    }

    async findByUserId(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const photographs = await this.photographyService.findByUserId(req);
            res.status(200).json(photographs);
        } catch (error) {
            next(error);
        }
    }

    async findOne(req: Request, res: Response, next: NextFunction) {
        try {
            const photography = await this.photographyService.findById(req.params.id, req as AuthRequest);
            if (!photography) return res.status(404).json({ error: "Photography not found" });
            res.status(200).json(photography);
        } catch (error) {
            next(error);
        }
    }
}
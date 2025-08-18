import { NextFunction, Request, Response } from "express";
import { WebsiteService } from "../services/website.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { HttpError } from "../error/HttpError";


export class WebsiteController {
    constructor(private websiteService: WebsiteService) {}
    
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
        const website = await this.websiteService.create(req);
        res.status(201).json(website);
        } catch (error) {
        next(error);
        }
    }
    
    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
        const websites = await this.websiteService.findAll();
        res.status(200).json(websites);
        } catch (error) {
        next(error);
        }
    }
    
    async findByUserId(req: AuthRequest, res: Response, next: NextFunction) {
        try {
        if (!req.user) throw new HttpError("User not authenticated", 401);
        const websites = await this.websiteService.findByUserId(req.user.id);
        res.status(200).json(websites);
        } catch (error) {
        next(error);
        }
    }
    
    async findOne(req: AuthRequest, res: Response, next: NextFunction) {
        try {
        const website = await this.websiteService.findById(req.params.id, req);
        if (!website) return res.status(404).json({ error: "Website not found" });
        res.status(200).json(website);
        } catch (error) {
        next(error);
        }
    }
    
    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
        const website = await this.websiteService.findById(req.params.id, req);
        if (!website) return res.status(404).json({ error: "Website not found" });
        
        const updatedWebsite = await this.websiteService.update(req.params.id, req);
        res.status(200).json(updatedWebsite);
        } catch (error) {
        next(error);
        }
    }
    
    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
        const website = await this.websiteService.findById(req.params.id, req);
        if (!website) return res.status(404).json({ error: "Website not found" });
        
        await this.websiteService.delete(req.params.id, req);
        res.status(204).send();
        } catch (error) {
        next(error);
        }
    }
    }
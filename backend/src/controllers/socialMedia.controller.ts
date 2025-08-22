import { NextFunction, Request, Response } from "express";
import { SocialMediaService } from "../services/socialMedia.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { Social } from "../entities/socialMedia.entities";
import { HttpError } from "../error/HttpError";

export class SocialMediaController {
  constructor(private socialMediaService: SocialMediaService) {}

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const socialMedia = await this.socialMediaService.create(req);
      res.status(201).json(socialMedia);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const socialMedias = await this.socialMediaService.findAll();
      res.status(200).json(socialMedias);
    } catch (error) {
      next(error);
    }
  }

  async findByUserId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new HttpError("User not authenticated", 401);
      const socialMedias = await this.socialMediaService.findByUserId(req.user.id);
      res.status(200).json(socialMedias);
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const socialMedia = await this.socialMediaService.findById(req.params.id, req);
      if (!socialMedia) return res.status(404).json({ error: "Social media not found" });
      res.status(200).json(socialMedia);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const socialMedia = await this.socialMediaService.findById(req.params.id, req);
      if (!socialMedia) return res.status(404).json({ error: "Social media not found" });

      const updatedSocialMedia = await this.socialMediaService.update(req.params.id, req);
      res.status(200).json(updatedSocialMedia);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const socialMedia = await this.socialMediaService.findById(req.params.id, req);
      if (!socialMedia) return res.status(404).json({ error: "Social media not found" });

      await this.socialMediaService.delete(req.params.id, req);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
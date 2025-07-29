import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../interfaces/auth.interface";
import { TagService } from "../services/tag.service";

export class TagController {
  constructor(private tagService: TagService) {}

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tagData = req.body
      tagData.user = req.user
      const tag = await this.tagService.create(req.body);
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await this.tagService.findAll();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await this.tagService.findOne(req.params.id);
      if (!tag) return res.status(404).json({ error: "Tag not found" });
      res.json(tag);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await this.tagService.update(req.params.id, req.body);
      if (!tag) return res.status(404).json({ error: "Tag not found" });
      res.json(tag);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedTag = await this.tagService.remove(req.params.id);
      res.status(204).send(deletedTag);
    } catch (error) {
      next(error);
    }
  }
}

import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../interfaces/auth.interface";
import { TagService } from "../services/tag.service";
import logger from "../logger/app.logger";

export class TagController {
  constructor(private tagService: TagService) {}

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      logger.info(`Creating new tag for user: ${req.user?.id || 'unknown'}, data: ${JSON.stringify(req.body)}`);
      const tagData = req.body;
      tagData.user = req.user;
      
      if (!req.user) {
        logger.warn(`Tag creation failed: User not authenticated`);
        throw new Error("User not authenticated");
      }

      if (!tagData.name) {
        logger.warn(`Tag creation failed: Missing tag name for user: ${req.user.id}`);
        throw new Error("Tag name required");
      }

      const tag = await this.tagService.create(tagData);
      logger.info(`Successfully created tag with ID: ${tag.id} for user: ${req.user.id}`);
      res.status(201).json(tag);
    } catch (error) {
      logger.error(`Error creating tag for user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`Fetching all tags`);
      const tags = await this.tagService.findAll();
      logger.info(`Successfully retrieved ${tags.length} tags`);
      res.json(tags);
    } catch (error) {
      logger.error(`Error fetching all tags: ${error}`);
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Fetching tag with ID: ${id}`);
      const tag = await this.tagService.findOne(id);
      if (!tag) {
        logger.warn(`Tag not found with ID: ${id}`);
        return res.status(404).json({ error: "Tag not found" });
      }
      logger.info(`Successfully retrieved tag with ID: ${id}`);
      res.json(tag);
    } catch (error) {
      logger.error(`Error fetching tag with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Updating tag with ID: ${id}, data: ${JSON.stringify(req.body)}`);
      const tag = await this.tagService.update(id, req.body);
      if (!tag) {
        logger.warn(`Tag not found for update with ID: ${id}`);
        return res.status(404).json({ error: "Tag not found" });
      }
      logger.info(`Successfully updated tag with ID: ${id}`);
      res.json(tag);
    } catch (error) {
      logger.error(`Error updating tag with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Deleting tag with ID: ${id}`);
      const tag = await this.tagService.findOne(id);
      if (!tag) {
        logger.warn(`Tag not found for deletion with ID: ${id}`);
        return res.status(404).json({ error: "Tag not found" });
      }
      await this.tagService.remove(id);
      logger.info(`Successfully deleted tag with ID: ${id}`);
      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting tag with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }
}
import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import logger from "../logger/app.logger";

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`Creating new category with data: ${JSON.stringify(req.body)}`);
      const category = await this.categoryService.create(req.body);
      logger.info(`Successfully created category with ID: ${category.id}`);
      res.status(201).json(category);
    } catch (error) {
      logger.error(`Error creating category: ${error}`);
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`Fetching all categories`);
      const categories = await this.categoryService.findAll();
      logger.info(`Successfully retrieved ${categories.length} categories`);
      res.json(categories);
    } catch (error) {
      logger.error(`Error fetching all categories: ${error}`);
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Fetching category with ID: ${id}`);
      const category = await this.categoryService.findOne(id);
      if (!category) {
        logger.warn(`Category not found with ID: ${id}`);
        return res.status(404).json({ error: "Category not found" });
      }
      logger.info(`Successfully retrieved category with ID: ${id}`);
      res.json(category);
    } catch (error) {
      logger.error(`Error fetching category with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Updating category with ID: ${id}, data: ${JSON.stringify(req.body)}`);
      const category = await this.categoryService.update(id, req.body);
      if (!category) {
        logger.warn(`Category not found for update with ID: ${id}`);
        return res.status(404).json({ error: "Category not found" });
      }
      logger.info(`Successfully updated category with ID: ${id}`);
      res.json(category);
    } catch (error) {
      logger.error(`Error updating category with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Deleting category with ID: ${id}`);
      const category = await this.categoryService.findOne(id);
      if (!category) {
        logger.warn(`Category not found for deletion with ID: ${id}`);
        return res.status(404).json({ error: "Category not found" });
      }
      await this.categoryService.remove(id);
      logger.info(`Successfully deleted category with ID: ${id}`);
      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting category with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }
}
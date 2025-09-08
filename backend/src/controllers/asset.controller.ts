import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "interfaces/auth.interface";
import { AssetService } from "../services/asset.service";
import { AppDataSource } from "../database/db";
import { Asset } from "../entities/asset.entities";
import { applyAssetFilters } from "../filters/assets.filter";
import logger from "../logger/app.logger";

export class AssetController {
  constructor(private assetService: AssetService) {}

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      logger.info(`Creating new asset for user: ${req.user?.id || 'unknown'}`);
      const asset = await this.assetService.create(req);
      logger.info(`Successfully created asset with ID: ${asset.id} for user: ${req.user?.id || 'unknown'}`);
      res.status(201).json(asset);
    } catch (error) {
      logger.error(`Error creating asset for user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  async count(req:Request, res: Response, next: NextFunction){
    try{
      const count = await this.assetService.getCounts()
      res.status(200).json({count})
    } catch (error){
      next(error)
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`Fetching assets with filters: ${JSON.stringify(req.query)}`);
      const filters = req.query;

      const query = AppDataSource.getRepository(Asset)
        .createQueryBuilder("asset")
        .leftJoinAndSelect("asset.user", "user")
        .leftJoinAndSelect("asset.category", "category")
        .leftJoinAndSelect("asset.tags", "tags");

      const assets = await applyAssetFilters(query, filters);
      logger.info(`Successfully retrieved ${assets.results.length} assets`);
      res.json(assets);
    } catch (error) {
      logger.error(`Error fetching assets: ${error}`);
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Fetching asset with ID: ${id}`);
      const asset = await this.assetService.findOne(id);
      if (!asset) {
        logger.warn(`Asset not found with ID: ${id}`);
        return res.status(404).json({ error: "Asset not found" });
      }
      logger.info(`Successfully retrieved asset with ID: ${id}`);
      res.json(asset);
    } catch (error) {
      logger.error(`Error fetching asset with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Updating asset with ID: ${id}`);
      const asset = await this.assetService.update(id, req);
      if (!asset) {
        logger.warn(`Asset not found for update with ID: ${id}`);
        return res.status(404).json({ error: "Asset not found" });
      }
      logger.info(`Successfully updated asset with ID: ${id}`);
      res.json(asset);
    } catch (error) {
      logger.error(`Error updating asset with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Deleting asset with ID: ${id}`);
      await this.assetService.remove(id);
      logger.info(`Successfully deleted asset with ID: ${id}`);
      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting asset with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }
}
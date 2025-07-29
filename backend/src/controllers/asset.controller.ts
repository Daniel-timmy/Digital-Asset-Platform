import { NextFunction, Request, Response } from "express";
import { AssetService } from "../services/asset.service";
import { AuthRequest } from "interfaces/auth.interface";
import { AppDataSource } from "../database/db";
import { Asset } from "../entities/asset.entities";
import { applyAssetFilters } from "../filters/assets.filter";


export class AssetController {

  constructor(private assetService: AssetService) {}

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const asset = await this.assetService.create(req);
      res.status(201).json(asset);
    } catch (error) {
     next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const assets = await this.assetService.findAll();
      // const filters = validateEventFilter(req.query);
      const filters = req.query;

      const query =  AppDataSource.getRepository(Asset)
            .createQueryBuilder("asset")
            .leftJoinAndSelect("asset.user", "user")
            .leftJoinAndSelect("asset.category", "category")
            .leftJoinAndSelect("asset.tags", "tags");

      const lasset = await applyAssetFilters(query, filters)
      // console.log(lasset)
      res.json(lasset);
    } catch (error) {
     next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await this.assetService.findOne(req.params.id);
      if (!asset) return res.status(404).json({ error: "Asset not found" });
      res.json(asset);
    } catch (error) {
     next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await this.assetService.update(req.params.id, req.body);
      if (!asset) return res.status(404).json({ error: "Asset not found" });
      res.json(asset);
    } catch (error) {
     next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await this.assetService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
     next(error);

     
    }
  }
}

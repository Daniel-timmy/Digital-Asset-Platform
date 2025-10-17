import { NextFunction, Request, Response } from "express";
import { DownloadService } from "../services/download.service";
import { AuthRequest } from "../interfaces/auth.interface";

export class DownloadController {
  constructor(private downloadService: DownloadService) {}

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const download = await this.downloadService.create(req);
      res.status(201).json(download);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const downloads = await this.downloadService.findAll(req);
      res.json(downloads);
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const download = await this.downloadService.findOne(req.params.id);
      if (!download) return res.status(404).json({ error: "Download not found" });
      res.json(download);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const download = await this.downloadService.update(req.params.id, req.body);
      if (!download) return res.status(404).json({ error: "Download not found" });
      res.json(download);
    } catch (error) {
      next(error);
    }
  }

  async count(req: AuthRequest, res: Response, next: NextFunction){
    try{
      const creatorId = req.query.creator as string;
      const count = await this.downloadService.getCount(creatorId);
      res.status(200).json({count})
    } catch (error){
      next(error)
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await this.downloadService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

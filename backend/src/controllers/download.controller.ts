import { NextFunction, Request, Response } from "express";
import { DownloadService } from "../services/download.service";

export class DownloadController {
  constructor(private downloadService: DownloadService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const download = await this.downloadService.create(req.body);
      res.status(201).json(download);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const downloads = await this.downloadService.findAll();
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

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await this.downloadService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

import { NextFunction, Request, Response } from "express";
import { LicenseService } from "../services/license.service";

export class LicenseController {
  constructor(private licenseService: LicenseService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const license = await this.licenseService.create(req.body);
      res.status(201).json(license);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const licenses = await this.licenseService.findAll();
      res.json(licenses);
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const license = await this.licenseService.findOne(req.params.id);
      if (!license) return res.status(404).json({ error: "License not found" });
      res.json(license);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const license = await this.licenseService.update(req.params.id, req.body);
      if (!license) return res.status(404).json({ error: "License not found" });
      res.json(license);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await this.licenseService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

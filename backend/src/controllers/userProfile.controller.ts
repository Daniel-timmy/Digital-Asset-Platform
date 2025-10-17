import { Request, Response } from "express";
import { UserProfileService } from "../services/userProfile.service";
import { AuthRequest } from "../interfaces/auth.interface";

function validateProfileData(data: any) {
  const errors: string[] = [];
  if (data.phone && typeof data.phone !== "string") errors.push("phone must be a string");
  if (data.address && typeof data.address !== "string") errors.push("address must be a string");
  if (data.avatarUrl && typeof data.avatarUrl !== "string") errors.push("avatarUrl must be a string");
  if (data.description && typeof data.description !== "string") errors.push("description must be a string");
  if (data.instagram && typeof data.instagram !== "string") errors.push("instagram must be a string");
  if (data.x && typeof data.x !== "string") errors.push("x must be a string");
  if (data.facebook && typeof data.facebook !== "string") errors.push("facebook must be a string");
  if (data.coverPhoto && typeof data.coverPhoto !== "string") errors.push("coverPhoto must be a string");
  if (data.title && typeof data.title !== "string") errors.push("title must be a string");
  if (data.interest && !Array.isArray(data.interest)) errors.push("interest must be an array of strings");
  return errors;
}

export class UserProfileController {
  constructor(private service: UserProfileService) {}

  async create(req: AuthRequest, res: Response) {
    const errors = validateProfileData(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }
    const profile = await this.service.create(req.body);
    res.json(profile);
  }

  async getById(req: AuthRequest, res: Response) {
    const profile = await this.service.getById(req.params.id);
    res.json(profile);
  }

  async update(req: AuthRequest, res: Response) {
    const errors = validateProfileData(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }
    const profile = await this.service.update(req.params.id, req.body);
    res.json(profile);
  }

  async delete(req: AuthRequest, res: Response) {
    await this.service.delete(req.params.id);
    res.sendStatus(204);
  }
}

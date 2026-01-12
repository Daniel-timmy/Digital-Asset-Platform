import { NextFunction, Response } from "express";
import { UserProfileService } from "../services/userProfile.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { HttpError } from "../error/HttpError";
import { z } from "zod";

const profileSchema = z.object({
  phone: z.string()
    .regex(/^\+?[\d\s-()]{10,20}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters").optional().or(z.literal("")),
  description: z.string().min(10, "Description must be at least 10 characters").optional().or(z.literal("")),
  instagram: z.string()
    .regex(/^(https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?|[a-zA-Z0-9_.]+)$/, "Invalid Instagram URL or handle")
    .optional()
    .or(z.literal("")),
  x: z.string()
    .regex(/^(https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?|[a-zA-Z0-9_]+)$/, "Invalid X (Twitter) URL or handle")
    .optional()
    .or(z.literal("")),
  facebook: z.string()
    .regex(/^(https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?|[a-zA-Z0-9.]+)$/, "Invalid Facebook URL or handle")
    .optional()
    .or(z.literal("")),
  title: z.string().min(2, "Title must be at least 2 characters").optional().or(z.literal("")),
  interest: z.array(z.string()).optional(),
});

function validateProfileData(data: any) {
  const result = profileSchema.safeParse(data);
  if (!result.success) {
    const flattened = result.error.flatten();
    const errors: string[] = [];
    Object.entries(flattened.fieldErrors).forEach(([key, messages]) => {
      if (messages) {
        messages.forEach((msg: string) => errors.push(`${key}: ${msg}`));
      }
    });
    return errors;
  }
  return [];
}

export class UserProfileController {
  constructor(private service: UserProfileService) { }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    const profile = await this.service.getById(req.params.id);
    res.json(profile);
  }

  async getByUser(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      throw new HttpError("You are not authorized to get this profile", 403);
    }
    const profile = await this.service.getByUser(req.user.id);
    res.json(profile);
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    const errors = validateProfileData(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }
    const profile = await this.service.update(req.params.id, req);
    res.json(profile);
  }


}

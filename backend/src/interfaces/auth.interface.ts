import { Request, Response, NextFunction } from "express";
import { User } from "../entities/user.entities";

interface AssetFiles {
  file?: Express.Multer.File[];
  thumbnail?: Express.Multer.File[];
}


export interface AuthRequest extends Request {
    user?: User;
    files?: any;
}
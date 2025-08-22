import { Request, Response, NextFunction } from "express";
import { User } from "../entities/user.entities";

export interface AuthRequest extends Request {
    user?: User;
    file?: any;
}
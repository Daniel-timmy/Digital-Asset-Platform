import { Response } from "express";
import jwt from 'jsonwebtoken'
import { AuthRequest } from "../interfaces/auth.interface";
import { JWT_SECRET } from '../config/env'
import { UserService } from "../services/user.service";
import { NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';


const userController = new UserService();


interface JwtPayload {
    userId: string;
    iat?: number;
    exp?: number;
    [key: string]: any;
}

export const authentication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token: string | undefined;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
        const user = await userController.findOne(decoded.userId);

        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (user.status === "deleted") {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        req.user = user

        next();
    } catch (error: any) {
        if (error instanceof TokenExpiredError) {
            res.status(401).json({ message: 'Token expired' });
        } else if (error instanceof JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
        } else {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
        return;
    }
}

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req?.user && req.user.role === 'admin') {
        next()
    } else {
        res.status(401).json({ message: 'You are not allowed to acces this route' });

    }
}

export const isCreatorOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req?.user && req.user.role === 'creator' || req?.user && req.user.role === 'admin') {
        next()
    } else {
        res.status(401).json({ message: 'You are not allowed to acces this route' });

    }
}

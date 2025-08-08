import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import {IUser} from "../interfaces/user.interface";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_SECRET, JWT_REFRESH_SECRET} from '../config/env';
import { HttpError } from "../error/HttpError";

export class AuthController {

    constructor(private userService: UserService) {}

    async register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const userData: IUser = req.body;

            // const { name, email, password } = req.body;

            if (!userData.name || !userData.email || !userData.password){
               throw new HttpError("Missing required parameter", 400);
            }

            const existingUser = await this.userService.findByEmail(userData.email);
    
            if(existingUser) {
             throw new HttpError("User with email already exists", 409);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            const userDataWithHashedPassword: IUser = {
                ...userData,
                password: hashedPassword
            };
            const newUser = await this.userService.create(userDataWithHashedPassword);
           
            const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // Default to 1 day if not set
            if (!JWT_SECRET) {
                throw new HttpError("JWT_SECRET is not defined", 500);
            }
            const access = jwt.sign(
                { userId: newUser.id, email: newUser.email },
                JWT_SECRET as jwt.Secret,
                { expiresIn: '1d'  } 
            );
            // Generate refresh token
            const refresh = jwt.sign(
                { userId: newUser.id},
                JWT_REFRESH_SECRET as jwt.Secret,
                { expiresIn: '7d' } // Refresh token valid for 7 days
            );
          

            return res.status(201).json(
                {
                    success: true,
                    message: 'User created successfully',
                    
                      access,
                      refresh,
                      user: newUser,
                    
                }
            );
        } catch (error) {
            return next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { refresh } = req.body;
            if (!refresh) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                    data: null
                });
            }
            if (!JWT_SECRET) {
                throw new HttpError("JWT_SECRET is not defined", 500);
            }
            let payload: any;
            try {
                payload = jwt.verify(refresh, JWT_SECRET as jwt.Secret);
            } catch (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired refresh token',
                    data: null
                });
            }
            const user = await this.userService.findOne(payload.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    data: null
                });
            }
            const access = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET as jwt.Secret,
                { expiresIn: '1d' }
            );
            const refreshToken = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_REFRESH_SECRET as jwt.Secret,
                { expiresIn: '7d' } // Refresh token valid for 7 days
            );
            return res.status(200).json({
                success: true,
                message: 'Access token refreshed successfully',
                    access,
                    refresh: refreshToken,
                    user
            });
        } catch (error) {
            return next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { email, password } = req.body;
            const isValidEmail = /\S+@\S+\.\S+/.test(email);
            if (!email || !isValidEmail) {
                throw new Error("Invalid email format");
            }
            const user = await this.userService.findByEmail(email);
            if(!user) {
              return res.status(404).json({
                success: false,
                message: 'User with email not found',
                data: null,
                details: 
                  {
                    "field": "email",
                    "error": "Invalid Email Address"
                  },
              });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: 'Invalid password',
            data: null,
            details: 
              {
                "field": "password",
                "error": "Your password is incorrect"
              },
            });
        }
        const access = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET as jwt.Secret,
            { expiresIn: '1d'  } // JWT_EXPIRES_IN
            );
        const refresh = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_REFRESH_SECRET as jwt.Secret,
            { expiresIn: '7d' } // Refresh token valid for 7 days
        );
          

            
        res.status(200).json({
          success: true,
          message: 'User signed in successfully',
            access,
            refresh,
            user,
        });
        } catch (error) {
            return next(error);
        }
    }
    async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {}

}
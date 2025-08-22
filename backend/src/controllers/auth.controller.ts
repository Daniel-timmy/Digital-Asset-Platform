import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { IUser, IUserAdmin } from "../interfaces/user.interface";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_SECRET, JWT_REFRESH_SECRET, FRONTEND_URL } from '../config/env';
import { HttpError } from "../error/HttpError";
import { redisClient } from "../database/redis_cache";
import { sendVerificationEmail } from "../utils/sendEmail";
import logger from "../logger/app.logger";


function generateVerificationCode(): string {
  try {
    logger.info(`Generating 6-character verification code`);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    logger.info(`Successfully generated verification code: ${code}`);
    return code;
  } catch (error) {
    logger.error(`Error generating verification code: ${error}`);
    throw new Error("Failed to generate verification code");
  }
}

export class AuthController {
  constructor(private userService: UserService) {}

  async registerAdmin(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      logger.info(`Registering new user with email: ${req.body.email}`);
      const userData: IUserAdmin = req.body;

      if (!userData.name || !userData.email || !userData.password || !userData.role) {
        logger.warn(`Registration failed: Missing required parameters for email ${req.body.email}`);
        throw new HttpError("Missing required parameter", 400);
      }

      const existingUser = await this.userService.findByEmail(userData.email);
      if (existingUser) {
        logger.warn(`Registration failed: User with email ${userData.email} already exists`);
        throw new HttpError("User with email already exists", 409);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const userDataWithHashedPassword: IUserAdmin = {
        ...userData,
        password: hashedPassword,
      };
      const newUser = await this.userService.create(userDataWithHashedPassword);
      logger.info(`Successfully created user with ID: ${newUser.id}, email: ${newUser.email}`);

      const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
      if (!JWT_SECRET) {
        logger.error(`JWT_SECRET is not defined during registration for email ${userData.email}`);
        throw new HttpError("JWT_SECRET is not defined", 500);
      }

      const access = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        JWT_SECRET as jwt.Secret,
        { expiresIn: '1d' }
      );
      const refresh = jwt.sign(
        { userId: newUser.id },
        JWT_REFRESH_SECRET as jwt.Secret,
        { expiresIn: '7d' }
      );

      logger.info(`Generated access and refresh tokens for user ID: ${newUser.id}`);
      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        access,
        refresh,
        user: newUser,
      });
    } catch (error) {
      logger.error(`Error registering user with email ${req.body.email || 'unknown'}: ${error}`);
      return next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      logger.info(`Initiating email verification for user with email: ${req.body.email}`);
      const {name, email, password} = req.body;
      const userData: IUser = {name, email, password}

      if (!userData.name || !userData.email || !userData.password) {
        logger.warn(`Email verification failed: Missing required parameters for email ${req.body.email}`);
        throw new HttpError("Missing required parameter", 400);
      }

      const existingUser = await this.userService.findByEmail(userData.email);
      if (existingUser) {
        logger.warn(`Email verification failed: User with email ${userData.email} already exists`);
        throw new HttpError("User with email already exists", 409);
      }

      const code: string = generateVerificationCode()
      await (await redisClient).set(
        code,
        JSON.stringify({ user: userData }),
        {
          EX: 3600,
          NX: true,
        }
      );
      logger.info(`Stored verification code in Redis for email: ${userData.email}`);
      
      await sendVerificationEmail(userData.email, code);
      logger.info(`Sent verification email to: ${userData.email}`);

      return res.status(201).json({
        success: true,
        message: 'Code sent to users email',
      });
    } catch (error) {
      logger.error(`Error during email verification for email ${req.body.email || 'unknown'}: ${error}`);
      return next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const cacheKey: string = req.body.code;
      logger.info(`Verifying code: ${cacheKey}`);

      if (!cacheKey) {
        logger.warn('Verification failed: No verification code provided');
        throw new Error("Verification code not provided");
      }

      const cachedData = await (await redisClient).get(cacheKey);
      if (!cachedData || typeof cachedData !== 'string') {
        logger.warn(`Verification failed: Invalid or expired code: ${cacheKey}`);
        throw new HttpError("Invalid or expired verification code", 400);
      }

      const data: any = JSON.parse(cachedData);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.user.password, salt);
      const userDataWithHashedPassword: IUser = {
        ...data.user,
        password: hashedPassword,
      };
      const newUser = await this.userService.create(userDataWithHashedPassword);
      if (!newUser) {
        logger.warn(`Verification failed: Could not create user for email ${data.user.email}`);
        throw new Error("Failed to create new user");
      }
      logger.info(`Successfully created user with ID: ${newUser.id}, email: ${newUser.email} after verification`);

      const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
      if (!JWT_SECRET) {
        logger.error(`JWT_SECRET is not defined during verification for email ${data.user.email}`);
        throw new HttpError("JWT_SECRET is not defined", 500);
      }

      const access = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        JWT_SECRET as jwt.Secret,
        { expiresIn: '1d' }
      );
      const refresh = jwt.sign(
        { userId: newUser.id },
        JWT_REFRESH_SECRET as jwt.Secret,
        { expiresIn: '7d' }
      );

      await (await redisClient).del(cacheKey);
      logger.info(`Deleted verification code from Redis for email: ${newUser.email}`);
      logger.info(`Generated access and refresh tokens for user ID: ${newUser.id}`);

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        access,
        refresh,
        user: newUser,
      });
    } catch (error) {
      logger.error(`Error verifying code ${req.body.code || 'unknown'}: ${error}`);
      return next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { refresh } = req.body;
      logger.info(`Refreshing token for provided refresh token`);

      if (!refresh) {
        logger.warn('Token refresh failed: No refresh token provided');
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          data: null,
        });
      }

      if (!JWT_SECRET) {
        logger.error('Token refresh failed: JWT_SECRET is not defined');
        throw new HttpError("JWT_SECRET is not defined", 500);
      }

      let payload: any;
      try {
        payload = jwt.verify(refresh, JWT_SECRET as jwt.Secret);
        logger.info(`Verified refresh token for user ID: ${payload.userId}`);
      } catch (err) {
        logger.warn(`Token refresh failed: Invalid or expired refresh token`);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
          data: null,
        });
      }

      const user = await this.userService.findOne(payload.userId);
      if (!user) {
        logger.warn(`Token refresh failed: User not found for ID: ${payload.userId}`);
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null,
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
        { expiresIn: '7d' }
      );
      logger.info(`Generated new access and refresh tokens for user ID: ${user.id}`);

      return res.status(200).json({
        success: true,
        message: 'Access token refreshed successfully',
        access,
        refresh: refreshToken,
        user,
      });
    } catch (error) {
      logger.error(`Error refreshing token: ${error}`);
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email, password } = req.body;
      logger.info(`Login attempt for email: ${email}`);

      const isValidEmail = /\S+@\S+\.\S+/.test(email);
      if (!email || !isValidEmail) {
        logger.warn(`Login failed: Invalid email format for email ${email}`);
        throw new Error("Invalid email format");
      }

      const user = await this.userService.findByEmail(email);
      if (!user) {
        logger.warn(`Login failed: User not found for email ${email}`);
        return res.status(404).json({
          success: false,
          message: 'User with email not found',
          data: null,
          details: {
            field: "email",
            error: "Invalid Email Address",
          },
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn(`Login failed: Invalid password for email ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid password',
          data: null,
          details: {
            field: "password",
            error: "Your password is incorrect",
          },
        });
      }

      const access = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET as jwt.Secret,
        { expiresIn: '1d' }
      );
      const refresh = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_REFRESH_SECRET as jwt.Secret,
        { expiresIn: '7d' }
      );
      logger.info(`Successful login for user ID: ${user.id}, email: ${user.email}`);
      logger.info(`Generated access and refresh tokens for user ID: ${user.id}`);

      return res.status(200).json({
        success: true,
        message: 'User signed in successfully',
        access,
        refresh,
        user,
      });
    } catch (error) {
      logger.error(`Error during login for email ${req.body.email || 'unknown'}: ${error}`);
      return next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      logger.info(`Logout attempt for user`);
      // Note: Implementation is empty, so no specific logging added here
      return res.status(200).json({
        success: true,
        message: 'User logged out successfully',
      });
    } catch (error) {
      logger.error(`Error during logout: ${error}`);
      return next(error);
    }
  }
}
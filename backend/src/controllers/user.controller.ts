import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { AuthRequest } from "interfaces/auth.interface";
import bcrypt from "bcryptjs";
import { IUserAdmin, IUser } from "../interfaces/user.interface";
import logger from "../logger/app.logger";
import { HttpError } from "../error/HttpError";
import { redisClient } from "../database/redis_cache";
import generateVerificationCode from "../utils/generateCode";
import { sendVerificationEmail } from "../utils/sendEmail";



export class UserController {
  constructor(private userService: UserService) { }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      logger.info(`Creating new user with email: ${req.body.email} by user: ${req.user?.id || 'unknown'}`);
      const { email, name, password } = req.body;
      const isValidEmail = /\S+@\S+\.\S+/.test(email);

      if (!email || !isValidEmail) {
        logger.warn(`Create user failed: Invalid or missing email for user: ${req.user?.id || 'unknown'}`);
        throw new Error("Valid Email Address required");
      }

      if (!name) {
        logger.warn(`Create user failed: Missing name for user: ${req.user?.id || 'unknown'}`);
        throw new Error("User's name required");
      }
      if (!password) {
        logger.warn(`Create user failed: Missing password for user: ${req.user?.id || 'unknown'}`);
        throw new Error("Password required");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userData: IUser = { email, password: hashedPassword, name };

      const user = await this.userService.create(userData);
      logger.info(`Successfully created user with ID: ${user.id}, email: ${user.email}`);
      res.status(201).json({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at,
        id: user.id
      });
    } catch (error) {
      logger.error(`Error creating user with email ${req.body.email || 'unknown'} by user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      logger.info(`Fetching all users by user: ${req.user?.id || 'unknown'}, role: ${req.user?.role || 'unknown'}`);
      if (req.user && req.user.role !== "admin") {
        logger.warn(`Unauthorized attempt to fetch all users by user: ${req.user.id}`);
        throw new Error("Admin access required");
      }

      const users = await this.userService.findAll();
      logger.info(`Successfully retrieved ${users.length} users`);
      res.json(users.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at,
        id: user.id
      })));
    } catch (error) {
      logger.error(`Error fetching all users by user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  async findOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Fetching user with ID: ${id} by user: ${req.user?.id || 'unknown'}, role: ${req.user?.role || 'unknown'}`);

      if (req.user && req.user.role !== "admin" && req.user.id !== id) {
        logger.warn(`Unauthorized attempt to fetch user ID: ${id} by user: ${req.user.id}`);
        throw new Error("Unauthorized activity");
      }

      const user = await this.userService.findOne(id);
      if (!user) {
        logger.warn(`User not found with ID: ${id} for user: ${req.user?.id || 'unknown'}`);
        return res.status(404).json({ error: "User not found" });
      }

      logger.info(`Successfully retrieved user with ID: ${id}`);
      res.json({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at,
        id: user.id
      });
    } catch (error) {
      logger.error(`Error fetching user with ID: ${req.params.id} by user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Updating user with ID: ${id} by user: ${req.user?.id || 'unknown'}, role: ${req.user?.role || 'unknown'}`);

      const { email, password, name, role } = req.body;
      const updateData: IUserAdmin = {};

      if (req.user && req.user.role !== "admin" && req.user.id !== id) {
        logger.warn(`Unauthorized attempt to update user ID: ${id} by user: ${req.user.id}`);
        throw new Error("Unauthorized change");
      }

      const isValidEmail = email ? /\S+@\S+\.\S+/.test(email) : false;
      if (email && isValidEmail) {
        updateData.email = email;
        logger.debug(`Updating email for user ID: ${id} to ${email}`);
      } else if (email && !isValidEmail) {
        logger.warn(`Invalid email format for update of user ID: ${id} by user: ${req.user?.id || 'unknown'}`);
        throw new Error("Valid Email Address required");
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateData.password = hashedPassword;
        logger.debug(`Updating password for user ID: ${id}`);
      }

      if (name) {
        updateData.name = name;
        logger.debug(`Updating name for user ID: ${id} to ${name}`);
      }

      if (role && req.user?.role === "admin") {
        updateData.role = role;
        logger.debug(`Updating role for user ID: ${id} to ${role}`);
      } else if (role && req.user?.role !== "admin") {
        logger.warn(`Non-admin user ${req.user?.id} attempted to update role for user ID: ${id}`);
        throw new Error("Unauthorized change");
      }

      const user = await this.userService.update(id, updateData);
      if (!user) {
        logger.warn(`User not found for update with ID: ${id} by user: ${req.user?.id || 'unknown'}`);
        return res.status(404).json({ error: "User not found" });
      }

      logger.info(`Successfully updated user with ID: ${id}`);
      res.status(200).json({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
        deleted_at: user.deleted_at,
        id: user.id
      });
    } catch (error) {
      logger.error(`Error updating user with ID: ${req.params.id} by user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Deleting user with ID: ${id} by user: ${req.user?.id || 'unknown'}, role: ${req.user?.role || 'unknown'}`);

      if (req.user && req.user.role !== "admin" && req.user.id !== id) {
        logger.warn(`Unauthorized attempt to delete user ID: ${id} by user: ${req.user.id}`);
        throw new Error("Unauthorized activity");
      }

      const user = await this.userService.findOne(id);
      if (!user) {
        logger.warn(`User not found for deletion with ID: ${id} by user: ${req.user?.id || 'unknown'}`);
        return res.status(404).json({ error: "User not found" });
      }

      await this.userService.remove(id);
      logger.info(`Successfully deleted user with ID: ${id}`);
      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting user with ID: ${req.params.id} by user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  async count(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await this.userService.countActiveUsers()
      res.status(200).json({ count })
    } catch (error) {
      next(error)
    }
  }

  async updateSelf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new HttpError("User not authenticated", 401);
      }
      const id = req.user.id;
      logger.info(`User ${id} updating their own profile`);

      const { name, password, oldPassword } = req.body;
      const updateData: Partial<IUser> = {};

      // Only allow name and email updates
      if (name) updateData.name = name;

      if (password && oldPassword) {
        const isValidPassword = await bcrypt.compare(oldPassword, req.user.password);
        if (!isValidPassword) {
          throw new Error("Invalid old password");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateData.password = hashedPassword;
      }
      const user = await this.userService.update(id, updateData);
      if (!user) {
        throw new HttpError("User not found", 404);
      }

      logger.info(`Successfully updated self profile for user: ${id}`);
      res.status(200).json(user);
    } catch (error) {
      logger.error(`Error updating self profile: ${error}`);
      next(error);
    }
  }

  async changeSelfEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        throw new HttpError("User not authenticated", 401);
      }
      const id = user.id;
      logger.info(`User ${id} updating their own email`);

      const { newEmail, oldEmail, password } = req.body;
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }
      if (newEmail === oldEmail) {
        throw new Error("New email must be different from old email");
      }
      const existUser = await this.userService.findByEmail(newEmail);
      if (existUser) {
        throw new Error("Email already exists");
      }
      const code: string = generateVerificationCode()
      await (await redisClient).set(
        code,
        JSON.stringify({ email: newEmail, id: user.id }),
        {
          EX: 3600,
          NX: true,
        }
      );
      await sendVerificationEmail(newEmail, code);
      return res.status(200).json({ message: "Verification email sent", success: true });

    } catch (error) {
      logger.error(`Error updating self email: ${error}`);
      next(error);
    }
  }

  async confirmSelfEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const code = req.body.code;
      const user = req.user;
      if (!user) {
        throw new HttpError("User not authenticated", 401);
      }

      const userData = await (await redisClient).get(code);
      if (!userData) {
        throw new HttpError("Invalid verification code", 400);
      }
      const { email, id } = JSON.parse(userData);
      const existingUser = await this.userService.findOne(id);
      if (!existingUser) {
        throw new HttpError("User not found", 404);
      }
      await this.userService.update(id, { email });
      await (await redisClient).del(code);
      return res.status(200).json({ message: "Email confirmed successfully", success: true });
    } catch (error) {
      logger.error(`Error confirming self email: ${error}`);
      next(error);
    }
  }

  async initiateForgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new HttpError("Valid email is required", 400);
      }

      const user = await this.userService.findByEmail(email);
      if (!user || user.status === "deleted") {
        throw new HttpError("Invalid email address", 404);
      }

      const code: string = generateVerificationCode();
      await (await redisClient).set(
        `forgot_pass_${code}`,
        JSON.stringify({ id: user.id }),
        { EX: 3600, NX: true }
      );

      await sendVerificationEmail(email, code);
      logger.info(`Forgot password initiated for email: ${email}`);
      return res.status(200).json({ message: "Verification code sent to email", success: true });

    } catch (error) {
      logger.error(`Error initiating forgot password: ${error}`);
      next(error);
    }
  }

  async confirmForgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, password } = req.body;

      if (!code) throw new HttpError("Verification code is required", 400);
      if (!password) throw new HttpError("New password is required", 400);

      const data = await (await redisClient).get(`forgot_pass_${code}`);
      if (!data) {
        throw new HttpError("Invalid or expired verification code", 400);
      }

      const { id } = JSON.parse(data);
      const user = await this.userService.findOne(id);

      if (!user) {
        throw new HttpError("User not found", 404);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await this.userService.update(id, { password: hashedPassword });
      await (await redisClient).del(`forgot_pass_${code}`);

      logger.info(`Password successfully reset for user ID: ${id}`);
      return res.status(200).json({ message: "Password reset successfully", success: true });

    } catch (error) {
      logger.error(`Error confirming forgot password: ${error}`);
      next(error);
    }
  }
}
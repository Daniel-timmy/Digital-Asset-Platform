import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { AuthRequest } from "interfaces/auth.interface";
import bcrypt from "bcryptjs";
import { IUser } from "../interfaces/user.interface";
import logger from "../logger/app.logger";

export class UserController {
  constructor(private userService: UserService) {}

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
      res.status(201).json(user);
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
      res.json(users);
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
      res.json(user);
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
      const updateData: IUser = {};

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
      res.status(200).json(user);
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

    async count(req:Request, res: Response, next: NextFunction){
    try{
      const count = await this.userService.countActiveUsers()
      res.status(200).json({count})
    } catch (error){
      next(error)
    }
  }
}
import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { AuthRequest } from "interfaces/auth.interface";
import bcrypt from "bcryptjs";
import {IUser} from "../interfaces/user.interface";

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {email, name, password} = req.body
      const isValidEmail = /\S+@\S+\.\S+/.test(email);

      if (!email || isValidEmail) {
        if (!email) throw new Error("Valid Email Address required")
      }

      if (!name) throw new Error("User's name required")
      if (!password) throw new Error(" Password required")
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userData: IUser = { email, password: hashedPassword, name}

      const user = await this.userService.create(userData);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user && req.user.role !== "admin") throw new Error("Admin access required")
      const users = await this.userService.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findOne(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {

    try {
      if (req.user && req.user.role === "admin"){
        const {email, password, name, role} = req.body
        const updateData: IUser = {}
        // verify email validity
        const isValidEmail = /\S+@\S+\.\S+/.test(email);
        if (email && isValidEmail) {
          updateData.email = email;
        }

        if (password){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateData.password = hashedPassword
        }

        if (name) {
          updateData.name = name;
        }
        if (role) {
          updateData.role = role
        }

        const user = await this.userService.update(req.params.id, updateData);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);

      } else if (req.user && req.user.id !== req.params.id) throw new Error("Unauthorized change")
        const {email, password, name} = req.body
        const updateData: IUser = {}
        // verify email validity
        const isValidEmail = /\S+@\S+\.\S+/.test(email);
        if (email && isValidEmail) {
          updateData.email = email;
        }

        if (password){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateData.password = hashedPassword
        }

        if (name) {
          updateData.name = name;
        }


      const user = await this.userService.update(req.params.id, updateData);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (req.user && req.user.role === "admin"){
        await this.userService.remove(req.params.id);
        res.status(204).send();
      } else if (req.user && req.user.id !== req.params.id) throw new Error("Unauthorized activity")

      await this.userService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

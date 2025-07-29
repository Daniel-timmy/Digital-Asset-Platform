import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";

const userRouter = Router();
const userController = new UserController(new UserService());

userRouter.get("/", async (req, res, next) => {
         await userController.findAll(req, res, next)});

userRouter.get("/:id", async (req, res, next) => {
         await userController.findOne(req, res, next)});

userRouter.post("/", authentication, async (req, res, next) => {
         await userController.create(req, res, next)});

userRouter.put("/:id", authentication, isAdmin, async (req, res, next) => {
         await userController.update(req, res, next)});

userRouter.delete("/:id", authentication, isAdmin, async (req, res, next) => {
         await userController.remove(req, res, next)});

export default userRouter;

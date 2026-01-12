import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { UserService } from "../services/user.service";
import { UserController } from "../controllers/user.controller";

const userRouter = Router();
const userController = new UserController(new UserService());

userRouter.post("/forgot-password/initiate", async (req, res, next) => {
    await userController.initiateForgotPassword(req, res, next)
});

userRouter.post("/forgot-password/confirm", async (req, res, next) => {
    await userController.confirmForgotPassword(req, res, next)
});

userRouter.get("/", authentication, isAdmin, async (req, res, next) => {
    await userController.findAll(req, res, next)
});

userRouter.get("/s/count/", authentication, isAdmin, async (req, res, next) => {
    await userController.count(req, res, next)
});

userRouter.patch("/me", authentication, async (req, res, next) => {
    await userController.updateSelf(req, res, next)
});

userRouter.post("/change-email", authentication, async (req, res, next) => {
    await userController.changeSelfEmail(req, res, next)
});

userRouter.post("/confirm-email", authentication, async (req, res, next) => {
    await userController.confirmSelfEmail(req, res, next)
});

userRouter.get("/:id", authentication, async (req, res, next) => {
    await userController.findOne(req, res, next)
});

userRouter.post("/", authentication, async (req, res, next) => {
    await userController.create(req, res, next)
});

userRouter.put("/:id", authentication, isAdmin, async (req, res, next) => {
    await userController.update(req, res, next)
});

userRouter.delete("/:id", authentication, isAdmin, async (req, res, next) => {
    await userController.remove(req, res, next)
});

export default userRouter;

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserService } from "../services/user.service";

const authRouter = Router();
const authController = new AuthController( new UserService());

authRouter.post("/register", async (req, res, next) => {
		await authController.register(req, res, next);
});

authRouter.post("/login", async (req, res, next) => {
        await authController.login(req, res, next);
});
authRouter.get("/logout", async (req, res, next) => {
        await authController.logout(req, res, next);
});

authRouter.get("/refresh", async (req, res, next) => {
        await authController.refresh(req, res, next);
});

export default authRouter;
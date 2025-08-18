import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { SocialMediaService } from "../services/socialMedia.service";
import { SocialMediaController } from "../controllers/socialMedia.controller";

const socialMediaRouter = Router();
const socialMediaController = new SocialMediaController(new SocialMediaService());

socialMediaRouter.get("/", async (req, res, next) => {
    await socialMediaController.findAll(req, res, next);
});

socialMediaRouter.get("/user", authentication, async (req, res, next) => {
    await socialMediaController.findByUserId(req, res, next);
});

socialMediaRouter.get("/:id", authentication, async (req, res, next) => {
    await socialMediaController.findOne(req, res, next);
});

socialMediaRouter.post("/", async (req, res, next) => {
    await socialMediaController.create(req, res, next);
});

socialMediaRouter.patch("/:id", authentication, async (req, res, next) => {
    await socialMediaController.update(req, res, next);
});

socialMediaRouter.delete("/:id", authentication, async (req, res, next) => {
    await socialMediaController.delete(req, res, next);
});

export default socialMediaRouter;
import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { BrandingController } from "../controllers/branding.controller";
import { BrandingService } from "../services/branding.service";

const brandingRouter = Router();
const brandingController = new BrandingController(new BrandingService());

brandingRouter.get("/", authentication, isAdmin, async (req, res, next) => {
    await brandingController.findAll(req, res, next);
});

brandingRouter.get("/user", authentication, async (req, res, next) => {
    await brandingController.findByUserId(req, res, next);
});

brandingRouter.get("/:id", authentication, async (req, res, next) => {
    await brandingController.findOne(req, res, next);
});

brandingRouter.post("/", async (req, res, next) => {
    await brandingController.create(req, res, next);
});

brandingRouter.patch("/:id", authentication, async (req, res, next) => {
    await brandingController.update(req, res, next);
});

brandingRouter.delete("/:id", authentication, async (req, res, next) => {
    await brandingController.delete(req, res, next);
});

export default brandingRouter;
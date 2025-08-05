import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { WebsiteService } from "../services/website.service";
import { WebsiteController } from "../controllers/website.controller";

const websiteRouter = Router();
const websiteController = new WebsiteController(new WebsiteService());

websiteRouter.get("/", async (req, res, next) => {
    await websiteController.findAll(req, res, next);
});

websiteRouter.get("/user", authentication, async (req, res, next) => {
    await websiteController.findByUserId(req, res, next);
});

websiteRouter.get("/:id", authentication, async (req, res, next) => {
    await websiteController.findOne(req, res, next);
});

websiteRouter.post("/", authentication, async (req, res, next) => {
    await websiteController.create(req, res, next);
});
websiteRouter.patch("/:id", authentication, async (req, res, next) => {
    await websiteController.update(req, res, next);
});
websiteRouter.delete("/:id", authentication, async (req, res, next) => {
    await websiteController.delete(req, res, next);
});

export default websiteRouter;
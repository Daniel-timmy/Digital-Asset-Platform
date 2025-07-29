import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { TagService } from "../services/tag.service";
import { TagController } from "../controllers/tag.controller";

const tagRouter = Router();
const tagController = new TagController(new TagService());

tagRouter.get("/", async (req, res, next) => {
  await tagController.findAll(req, res, next);
});

tagRouter.get("/:id", async (req, res, next) => {
  await tagController.findOne(req, res, next);
});

tagRouter.post("/", authentication, isAdmin, async (req, res, next) => {
  await tagController.create(req, res, next);
});

tagRouter.patch("/:id", authentication, isAdmin, async (req, res, next) => {
  await tagController.update(req, res, next);
});

tagRouter.delete("/:id", authentication, isAdmin, async (req, res, next) => {
  await tagController.remove(req, res, next);
});

export default tagRouter;

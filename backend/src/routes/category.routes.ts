import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { CategoryService } from "../services/category.service";
import { CategoryController } from "../controllers/category.controller";

const categoryRouter = Router();
const categoryController = new CategoryController(new CategoryService());

categoryRouter.get("/", async (req, res, next) => {
  await categoryController.findAll(req, res, next);
});

categoryRouter.get("/:id", async (req, res, next) => {
  await categoryController.findOne(req, res, next);
});

categoryRouter.post("/", authentication, isAdmin, async (req, res, next) => {
  await categoryController.create(req, res, next);
});

categoryRouter.patch("/:id", authentication, isAdmin, async (req, res, next) => {
  await categoryController.update(req, res, next);
});

categoryRouter.delete("/:id", authentication, isAdmin, async (req, res, next) => {
  await categoryController.remove(req, res, next);
});

export default categoryRouter;

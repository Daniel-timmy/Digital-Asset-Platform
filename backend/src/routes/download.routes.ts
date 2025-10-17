import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { DownloadService } from "../services/download.service";
import { DownloadController } from "../controllers/download.controller";

const downloadRouter = Router();
const downloadController = new DownloadController(new DownloadService());

downloadRouter.get("/", authentication, async (req, res, next) => {
  await downloadController.findAll(req, res, next);
});

downloadRouter.get("/:id", authentication, async (req, res, next) => {
  await downloadController.findOne(req, res, next);
});

downloadRouter.post("/", authentication, isAdmin, async (req, res, next) => {
  await downloadController.create(req, res, next);
});

downloadRouter.put("/:id", authentication, isAdmin, async (req, res, next) => {
  await downloadController.update(req, res, next);
});

downloadRouter.get("/s/count", authentication, async (req, res, next) => {
  await downloadController.count(req, res, next);
});

downloadRouter.delete("/:id", authentication, isAdmin, async (req, res, next) => {
  await downloadController.remove(req, res, next);
});

export default downloadRouter;

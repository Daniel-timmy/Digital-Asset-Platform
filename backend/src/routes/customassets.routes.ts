import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { CustomAssetService } from "../services/customasset.service";
import { CustomAssetController } from "../controllers/customasset.controllers"; // Fixed typo in import path
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const customAssetRouter = Router();
const customAssetService = new CustomAssetService();
const customAssetController = new CustomAssetController(customAssetService);

customAssetRouter.post("/", authentication, upload.none(), async (req, res, next) => {
  console.log("req.body:", req.body);
  await customAssetController.create(req, res, next);
});

customAssetRouter.get("/",authentication, async (req, res, next) => {
  await customAssetController.findAll(req, res, next);
});

customAssetRouter.get("/:id", authentication, async (req, res, next) => {
  await customAssetController.findById(req, res, next);
});

customAssetRouter.post("/", authentication, upload.none(), async (req, res, next) => {
  await customAssetController.create(req, res, next);
});

customAssetRouter.put("/:id", authentication, isAdmin, async (req, res, next) => {
  await customAssetController.update(req, res, next);
});

customAssetRouter.delete("/:id", authentication, isAdmin, async (req, res, next) => {
  await customAssetController.delete(req, res, next);
});

// Mount download router for asset-related downloads (authenticated)
// customAssetRouter.use("/download", authentication, downloadRouter);

export default customAssetRouter;
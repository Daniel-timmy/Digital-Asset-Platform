import { Router } from "express";
import { authentication, isCreatorOrAdmin } from "../middlewares/auth.middleware";
import { AssetService } from "../services/asset.service";
import { AssetController } from "../controllers/asset.controller";
import multer from 'multer';
import { AuthRequest } from "../interfaces/auth.interface";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file: Express.Multer.File, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false); // Reject file with error
    }
  },
});

const assetRouter = Router();
const assetController = new AssetController(new AssetService());

assetRouter.get("/", async (req, res, next) => {
  await assetController.findAll(req, res, next)
});
assetRouter.get("/creator", authentication, isCreatorOrAdmin, async (req, res, next) => {
  await assetController.findAllByCreator(req, res, next)
});

assetRouter.get("/:id", async (req, res, next) => {
  await assetController.findOne(req, res, next)
});

assetRouter.post(
  "/",
  authentication,
  isCreatorOrAdmin,
  upload.fields([
    { name: "file", maxCount: 1 },
  ]),
  async (req: AuthRequest, res, next) => {
    await assetController.create(req, res, next)
  });

assetRouter.patch(
  "/:id",
  authentication,
  isCreatorOrAdmin,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  async (req, res, next) => {
    await assetController.update(req, res, next)
  });

assetRouter.delete("/:id", authentication, isCreatorOrAdmin, async (req, res, next) => {
  await assetController.remove(req, res, next)
});

assetRouter.get("/s/count/", authentication, async (req, res, next) => {
  await assetController.count(req, res, next)
});

export default assetRouter;

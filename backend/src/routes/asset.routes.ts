import { Router } from "express";
import { authentication, isCreatorOrAdmin } from "../middlewares/auth.middleware";
import { AssetService } from "../services/asset.service";
import { AssetController } from "../controllers/asset.controller";
import multer from 'multer';
import { AuthRequest } from "../interfaces/auth.interface";

const storage = multer.memoryStorage();

// Accept any file type for both 'file' and 'thumbnail'
const upload = multer({
  storage,
  // No fileFilter needed, accepts all types including figma, psd, svg, gif, png, jpeg, jpg, pdf
});

const assetRouter = Router();
const assetController = new AssetController(new AssetService());

assetRouter.get("/", async (req, res, next) => {
         await assetController.findAll(req, res, next)});

assetRouter.get("/:id", async (req, res, next) => {
         await assetController.findOne(req, res, next)});

assetRouter.post(
  "/",
  authentication,
  isCreatorOrAdmin,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  async (req: AuthRequest, res, next) => {
         await assetController.create(req, res, next)});

assetRouter.patch(
  "/:id",
  authentication,
  isCreatorOrAdmin,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  async (req, res, next) => {
         await assetController.update(req, res, next)});

assetRouter.delete("/:id", authentication, isCreatorOrAdmin, async (req, res, next) => {
         await assetController.remove(req, res, next)});

assetRouter.get("/s/count/", authentication, async (req, res, next)=>{
        await assetController.count(req, res, next)});

export default assetRouter;

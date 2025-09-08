import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { AssetService } from "../services/asset.service";
import { AssetController } from "../controllers/asset.controller";
import multer, { FileFilterCallback } from 'multer';
import { AuthRequest } from "../interfaces/auth.interface";

const storage = multer.memoryStorage();
// const upload = multer({ storage })


const upload = multer({
  storage,
  fileFilter: (req, file: Express.Multer.File, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
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
         await assetController.findAll(req, res, next)});

assetRouter.get("/:id", async (req, res, next) => {
         await assetController.findOne(req, res, next)});

assetRouter.post("/", authentication, isAdmin, upload.single("file"), async (req: AuthRequest, res, next) => {
         await assetController.create(req, res, next)});

assetRouter.patch("/:id", authentication, isAdmin, upload.single('file'), async (req, res, next) => {
         await assetController.update(req, res, next)});

assetRouter.delete("/:id", authentication, isAdmin, async (req, res, next) => {
         await assetController.remove(req, res, next)});

assetRouter.get("/s/count/", async (req, res, next)=>{
        await assetController.count(req, res, next)});

export default assetRouter;

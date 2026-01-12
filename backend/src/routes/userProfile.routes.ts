import { Router } from "express";
import { UserProfileService } from "../services/userProfile.service";
import { UserProfileController } from "../controllers/userProfile.controller";
import multer from 'multer';
import { authentication } from "../middlewares/auth.middleware";

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

const controller = new UserProfileController(new UserProfileService());
const router = Router();

router.get("/:id", authentication, async (req, res, next) => {
    await controller.getById(req, res, next)
});

router.get("/user/:id", authentication, async (req, res, next) => {
    await controller.getByUser(req, res, next)
});


router.put("/:id", authentication, upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
]), async (req, res, next) => {
    await controller.update(req, res, next)
});


export default router;

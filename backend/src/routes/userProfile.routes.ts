import { Router } from "express";
import { UserProfileService } from "../services/userProfile.service";
import { UserProfileController } from "../controllers/userProfile.controller";

const controller = new UserProfileController(new UserProfileService());
const router = Router();

router.post("/", async (req, res) => { 
    await controller.create(req, res)
});
router.get("/:id", async (req, res) => {
     await controller.getById(req, res)
});
router.put("/:id", async (req, res) => { 
    await controller.update(req, res)
});
router.delete("/:id", async (req, res) => { 
    await controller.delete(req, res)
});

export default router;

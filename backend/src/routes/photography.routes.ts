import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { PhotographyService } from "../services/photography.service";
import { PhotographyController } from "../controllers/photography.controller";

const photographyRouter = Router();
const photographyController = new PhotographyController(new PhotographyService());

photographyRouter.get("/", authentication, isAdmin, async (req, res, next) => {
    await photographyController.findAll(req, res, next);
});
photographyRouter.get("/user", authentication, async (req, res, next) => {
    await photographyController.findByUserId(req, res, next);
});

photographyRouter.get("/:id", async (req, res, next) => {
    await photographyController.findOne(req, res, next);
});

photographyRouter.post("/", authentication, async (req, res, next) => {
    await photographyController.create(req, res, next);
});
// photographyRouter.patch("/:id", authentication, async (req, res, next) => {
//     await photographyController.update(req, res, next);
// });
// photographyRouter.delete("/:id", authentication, async (req, res, next) => {
//     await photographyController.delete(req, res, next);
// });

export default photographyRouter;
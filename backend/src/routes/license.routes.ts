import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { LicenseService } from "../services/license.service";
import { LicenseController } from "../controllers/license.controller";

const licenseRouter = Router();
const licenseController = new LicenseController(new LicenseService());

licenseRouter.get("/", async (req, res, next) => {
  await licenseController.findAll(req, res, next);
});

licenseRouter.get("/:id", async (req, res, next) => {
  await licenseController.findOne(req, res, next);
});

licenseRouter.post("/", authentication, isAdmin, async (req, res, next) => {
  await licenseController.create(req, res, next);
});

licenseRouter.put("/:id", authentication, isAdmin, async (req, res, next) => {
  await licenseController.update(req, res, next);
});

licenseRouter.delete("/:id", authentication, isAdmin, async (req, res, next) => {
  await licenseController.remove(req, res, next);
});

export default licenseRouter;

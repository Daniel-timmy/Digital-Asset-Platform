import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware";
import { AnalyticsService } from "../services/analytics.service";
import { AnalyticsController } from "../controllers/analytics.controller";

const analyticsRouter = Router();
const analyticsController = new AnalyticsController(new AnalyticsService());

// All analytics routes require authentication
analyticsRouter.get("/dashboard", authentication, async (req, res, next) => {
    await analyticsController.getDashboard(req, res, next);
});

analyticsRouter.get("/chart", authentication, async (req, res, next) => {
    await analyticsController.getChart(req, res, next);
});

analyticsRouter.get("/top-products", authentication, async (req, res, next) => {
    await analyticsController.getTopProducts(req, res, next);
});

export default analyticsRouter;

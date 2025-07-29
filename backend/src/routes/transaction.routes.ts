import { Router } from "express";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { TransactionService } from "../services/transaction.service";
import { TransactionController } from "../controllers/transaction.controller";

const transactionRouter = Router();
const transactionController = new TransactionController(new TransactionService());

transactionRouter.get("/", async (req, res, next) => {
  await transactionController.findAll(req, res, next);
});

transactionRouter.get("/:id", async (req, res, next) => {
  await transactionController.findOne(req, res, next);
});

transactionRouter.post("/", authentication, isAdmin, async (req, res, next) => {
  await transactionController.create(req, res, next);
});

transactionRouter.put("/:id", authentication, isAdmin, async (req, res, next) => {
  await transactionController.update(req, res, next);
});

transactionRouter.delete("/:id", authentication, isAdmin, async (req, res, next) => {
  await transactionController.remove(req, res, next);
});

transactionRouter.post('/initialize-payment', authentication, async (req, res, next) => {
  await transactionController.initialize(req, res, next);

});

export default transactionRouter;

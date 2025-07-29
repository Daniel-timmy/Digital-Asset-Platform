import { Router } from "express";
import { MessageController } from "../controllers/message.controllers";
import { MessageService } from "../services/message.service";
import { authentication, isAdmin } from "../middlewares/auth.middleware";

const messageRouter = Router();
const messageController = new MessageController(new MessageService());

// Create a new message
messageRouter.post("/", authentication, async (req, res, next) => {
  await messageController.createMessage(req, res, next);
});

// Get a message by ID
messageRouter.get("/:id", authentication, async (req, res, next) => {
  await messageController.getMessageById(req, res, next);
});

// Get all messages for a ticket
messageRouter.get("/ticket/:ticketId", authentication, async (req, res, next) => {
  await messageController.getMessagesByTicket(req, res, next);
});

// Get all messages for the authenticated user
messageRouter.get("/user", authentication, async (req, res, next) => {
  await messageController.getMessagesByUser(req, res, next);
});

// Delete a message
messageRouter.delete("/:id", authentication, isAdmin, async (req, res, next) => {
  await messageController.deleteMessage(req, res, next);
});

export default messageRouter ;
import { Router } from "express";
import { TicketController } from "../controllers/ticket.controller";
import { TicketService } from "../services/ticket.service";
import { authentication, isAdmin } from "../middlewares/auth.middleware";
import { initializeSocket } from "../socket/socket.manager";
// import { getServer } from "../index";
import logger from "../logger/app.logger";

const ticketRouter = Router();

// Initialize socket.io when accessing ticket routes
// ticketRouter.use((req, res, next) => {
//     try {
//         const server = getServer();
//         if (server) {
//             initializeSocket(server);
//             logger.info('Socket.IO initialized for ticket routes');
//         }
//         next();
//     } catch (error) {
//         logger.error('Failed to initialize Socket.IO:', error);
//         next();
//     }
// });
const ticketController = new TicketController(new TicketService());

// Create a new ticket
ticketRouter.post("/", authentication, async (req, res, next) => {
  await ticketController.createTicket(req, res, next);
});

// Get a ticket by ID
// ticketRouter.get("/:id", authentication, async (req, res, next) => {
//   await ticketController.getTicketById(req, res, next);
// });

// Get all tickets for the authenticated user
ticketRouter.get("/user/",authentication, async (req, res, next) => {
  await ticketController.getUserTickets(req, res, next);
});

// Get all tickets (optionally filtered by status)
ticketRouter.get("/", authentication, isAdmin, async (req, res, next) => {
  await ticketController.getAllTickets(req, res, next);
});

// Update ticket status
ticketRouter.patch("/:id", authentication, isAdmin, async (req, res, next) => {
  await ticketController.updateTicketStatus(req, res, next);
});

// Delete a ticket
ticketRouter.delete("/:id",authentication, isAdmin, async (req, res, next) => {
  await ticketController.deleteTicket(req, res, next);
});

export default ticketRouter;
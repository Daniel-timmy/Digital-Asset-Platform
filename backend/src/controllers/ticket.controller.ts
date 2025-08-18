import { NextFunction, Request, Response } from "express";
import { TicketService } from "../services/ticket.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { HttpError } from "../error/HttpError";
import logger from "../logger/app.logger";

export class TicketController {
  constructor(private ticketService: TicketService) {}

  // Create a new ticket
  async createTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(`Creating new ticket for user: ${req.user?.id || 'unknown'}, customAssetId: ${req.body.customAssetId}`);
      const { customAssetId } = req.body;

      if (!req.user) {
        logger.warn(`Ticket creation failed: User not authenticated`);
        throw new HttpError("User not authenticated", 401);
      }

      if (!customAssetId) {
        logger.warn(`Ticket creation failed: Missing customAssetId for user: ${req.user.id}`);
        throw new HttpError("Custom asset ID required", 400);
      }

      const ticket = await this.ticketService.createTicket(req, customAssetId);
      logger.info(`Successfully created ticket with ID: ${ticket.id} for user: ${req.user.id}`);
      res.status(201).json({ message: "Ticket created successfully", data: ticket });
    } catch (error) {
      logger.error(`Error creating ticket for user ${req.user?.id || 'unknown'}, customAssetId: ${req.body.customAssetId || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Get a ticket by ID
  async getTicketById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching ticket with ID: ${id} for user: ${req.user?.id || 'unknown'}`);

      if (!req.user) {
        logger.warn(`Ticket retrieval failed: User not authenticated for ticket ID: ${id}`);
        throw new HttpError("User not authenticated", 401);
      }
      const ticket = await this.ticketService.getTicketById(id, req);
      if (!ticket) {
        logger.warn(`Ticket not found with ID: ${id} for user: ${req.user.id}`);
        throw new HttpError("Ticket not found", 404);
      }

      logger.info(`Successfully retrieved ticket with ID: ${id} for user: ${req.user.id}`);
      res.status(200).json({ message: "Ticket retrieved successfully", data: ticket });
    } catch (error) {
      logger.error(`Error fetching ticket with ID: ${req.params.id} for user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Get all tickets for the authenticated user
  async getUserTickets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(`Fetching all tickets for user: ${req.user?.id || 'unknown'}`);
      if (!req.user) {
        logger.warn(`User tickets retrieval failed: User not authenticated`);
        throw new HttpError("User not authenticated", 401);
      }

      const tickets = await this.ticketService.getUserTickets(req);
      logger.info(`Successfully retrieved ${tickets.length} tickets for user: ${req.user.id}`);
      res.status(200).json({ message: "User tickets retrieved successfully", data: tickets });
    } catch (error) {
      logger.error(`Error fetching user tickets for user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Get all tickets (optionally filtered by status)
  async getAllTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      logger.info(`Fetching all tickets with status filter: ${status || 'none'}`);
      const tickets = await this.ticketService.getAllTickets(status as "open" | "closed");
      logger.info(`Successfully retrieved ${tickets.length} tickets`);
      res.status(200).json({ message: "Tickets retrieved successfully", data: tickets });
    } catch (error) {
      logger.error(`Error fetching all tickets with status ${req.query.status || 'none'}: ${error}`);
      next(error);
    }
  }

  // Update ticket status
  async updateTicketStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      logger.info(`Updating ticket status for ticket ID: ${id}, new status: ${status}`);

      if (!["open", "closed"].includes(status)) {
        logger.warn(`Ticket status update failed: Invalid status '${status}' for ticket ID: ${id}`);
        throw new HttpError("Invalid status. Must be 'open' or 'closed'", 400);
      }

      const ticket = await this.ticketService.updateTicketStatus(id, status);
      if (!ticket) {
        logger.warn(`Ticket not found for status update with ID: ${id}`);
        throw new HttpError("Ticket not found", 404);
      }

      logger.info(`Successfully updated ticket status for ticket ID: ${id} to ${status}`);
      res.status(200).json({ message: "Ticket status updated successfully", data: ticket });
    } catch (error) {
      logger.error(`Error updating ticket status for ticket ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }

  // Delete a ticket
  async deleteTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Deleting ticket with ID: ${id}`);
      // const ticket = await this.ticketService.getTicketById(id, req); // Check existence
      // if (!ticket) {
      //   logger.warn(`Ticket not found for deletion with ID: ${id}`);
      //   throw new HttpError("Ticket not found", 404);
      // }

      await this.ticketService.deleteTicket(id);
      logger.info(`Successfully deleted ticket with ID: ${id}`);
      res.status(200).json({ message: "Ticket deleted successfully" });
    } catch (error) {
      logger.error(`Error deleting ticket with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }
}
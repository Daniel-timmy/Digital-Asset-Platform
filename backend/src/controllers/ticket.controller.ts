import { NextFunction, Request, Response } from "express";
import { TicketService } from "../services/ticket.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { HttpError } from "../error/HttpError";

export class TicketController {
  constructor(private ticketService: TicketService) {}

  // Create a new ticket
  async createTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customAssetId } = req.body;
      const ticket = await this.ticketService.createTicket(req, customAssetId);
      res.status(201).json({ message: "Ticket created successfully", data: ticket });
    } catch (error) {
      next(error);
    }
  }

  // Get a ticket by ID
  async getTicketById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ticket = await this.ticketService.getTicketById(id, req);
      res.status(200).json({ message: "Ticket retrieved successfully", data: ticket });
    } catch (error) {
      next(error);
    }
  }

  // Get all tickets for the authenticated user
  async getUserTickets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        if(!req.user){
            throw new Error("User not found")
        }
      const userId = req.user.id;
      const tickets = await this.ticketService.getUserTickets(userId);
      res.status(200).json({ message: "User tickets retrieved successfully", data: tickets });
    } catch (error) {
      next(error);
    }
  }

  // Get all tickets (optionally filtered by status)
  async getAllTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const tickets = await this.ticketService.getAllTickets(status as "open" | "closed");
      res.status(200).json({ message: "Tickets retrieved successfully", data: tickets });
    } catch (error) {
      next(error);
    }
  }

  // Update ticket status
  async updateTicketStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["open", "closed"].includes(status)) {
        throw new HttpError("Invalid status. Must be 'open' or 'closed'", 400);
      }
      const ticket = await this.ticketService.updateTicketStatus(id, status);
      res.status(200).json({ message: "Ticket status updated successfully", data: ticket });
    } catch (error) {
      next(error);
    }
  }

  // Delete a ticket
  async deleteTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.ticketService.deleteTicket(id);
      res.status(200).json({ message: "Ticket deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
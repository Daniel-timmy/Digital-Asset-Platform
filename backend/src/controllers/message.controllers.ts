import { NextFunction, Request, Response } from "express";
import { MessageService } from "../services/message.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { HttpError } from "../error/HttpError";

export class MessageController {
  constructor(private messageService: MessageService) {}

  // Create a new message
  async createMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ticketId, message } = req.body;
      if (!message || typeof message !== "string" || message.trim() === "") {
        throw new HttpError("Message content is required", 400);
      }
      const newMessage = await this.messageService.createMessage(req, ticketId, message);
      res.status(201).json({ message: "Message created successfully", data: newMessage });
    } catch (error) {
      next(error);
    }
  }

  // Get a message by ID
  async getMessageById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const message = await this.messageService.getMessageById(id, req);
      res.status(200).json({ message: "Message retrieved successfully", data: message });
    } catch (error) {
      next(error);
    }
  }

  // Get all messages for a ticket
  async getMessagesByTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ticketId } = req.params;
      const messages = await this.messageService.getMessagesByTicket(ticketId, req);
      res.status(200).json({ message: "Messages retrieved successfully", data: messages });
    } catch (error) {
      next(error);
    }
  }

  // Get all messages for the authenticated user
  async getMessagesByUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
    if (!req.user) throw new Error(" User not authenticated")
      const userId = req.user.id;
      const messages = await this.messageService.getMessagesByUser(userId);
      res.status(200).json({ message: "User messages retrieved successfully", data: messages });
    } catch (error) {
      next(error);
    }
  }

  // Delete a message
  async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.messageService.deleteMessage(id);
      res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
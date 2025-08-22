import { NextFunction, Request, Response } from "express";
import { MessageService } from "../services/message.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { HttpError } from "../error/HttpError";
import logger from "../logger/app.logger";

export class MessageController {
  constructor(private messageService: MessageService) {}

  // Create a new message
  async createMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(`here: ${req.body}`)
      logger.info(`Creating new message for user: ${req.user?.id || 'unknown'}, ticketId: ${req.body.ticketId}`);
      const { ticketId, message } = req.body;

      if (!req.user) {
        logger.warn(`Message creation failed: User not authenticated`);
        throw new HttpError("User not authenticated", 401);
      }

      if (!ticketId) {
        logger.warn(`Message creation failed: Missing ticketId for user: ${req.user.id}`);
        throw new HttpError("Ticket ID required", 400);
      }

      if (!message || typeof message !== "string" || message.trim() === "") {
        logger.warn(`Message creation failed: Invalid or missing message content for user: ${req.user.id}, ticketId: ${ticketId}`);
        throw new HttpError("Message content is required", 400);
      }

      const newMessage = await this.messageService.createMessage(req, ticketId, message);
      logger.info(`Successfully created message with ID: ${newMessage.id} for user: ${req.user.id}, ticketId: ${ticketId}`);
      res.status(201).json({ message: "Message created successfully", data: newMessage });
    } catch (error) {
      logger.error(`Error creating message for user ${req.user?.id || 'unknown'}, ticketId: ${req.body.ticketId || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Get a message by ID
  async getMessageById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching message with ID: ${id} for user: ${req.user?.id || 'unknown'}`);

      if (!req.user) {
        logger.warn(`Message retrieval failed: User not authenticated for message ID: ${id}`);
        throw new HttpError("User not authenticated", 401);
      }

      const message = await this.messageService.getMessageById(id, req);
      if (!message) {
        logger.warn(`Message not found with ID: ${id} for user: ${req.user.id}`);
        throw new HttpError("Message not found", 404);
      }

      logger.info(`Successfully retrieved message with ID: ${id} for user: ${req.user.id}`);
      res.status(200).json({ message: "Message retrieved successfully", data: message });
    } catch (error) {
      logger.error(`Error fetching message with ID: ${req.params.id} for user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Get all messages for a ticket
  async getMessagesByTicket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ticketId } = req.params;
      logger.info(`Fetching messages for ticket ID: ${ticketId} for user: ${req.user?.id || 'unknown'}`);

      if (!req.user) {
        logger.warn(`Messages retrieval failed: User not authenticated for ticket ID: ${ticketId}`);
        throw new HttpError("User not authenticated", 401);
      }

      if (!ticketId) {
        logger.warn(`Messages retrieval failed: Missing ticketId for user: ${req.user.id}`);
        throw new HttpError("Ticket ID required", 400);
      }

      const messages = await this.messageService.getMessagesByTicket(ticketId, req);
      logger.info(`Successfully retrieved ${messages.length} messages for ticket ID: ${ticketId}, user: ${req.user.id}`);
      res.status(200).json({ message: "Messages retrieved successfully", data: messages });
    } catch (error) {
      logger.error(`Error fetching messages for ticket ID: ${req.params.ticketId} for user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Get all messages for the authenticated user
  async getMessagesByUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(`Fetching all messages for user: ${req.user?.id || 'unknown'}`);
      if (!req.user) {
        logger.warn(`User messages retrieval failed: User not authenticated`);
        throw new HttpError("User not authenticated", 401);
      }

      const userId = req.user.id;
      const messages = await this.messageService.getMessagesByUser(userId);
      logger.info(`Successfully retrieved ${messages.length} messages for user: ${userId}`);
      res.status(200).json({ message: "User messages retrieved successfully", data: messages });
    } catch (error) {
      logger.error(`Error fetching user messages for user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  // Delete a message
  async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Deleting message with ID: ${id}`);
      // const message = await this.messageService.getMessageById(id, null); // Check existence
      // if (!message) {
      //   logger.warn(`Message not found for deletion with ID: ${id}`);
      //   throw new HttpError("Message not found", 404);
      // }

      await this.messageService.deleteMessage(id);
      logger.info(`Successfully deleted message with ID: ${id}`);
      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting message with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }
}
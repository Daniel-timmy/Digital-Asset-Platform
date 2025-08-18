import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { Message } from "../entities/message.entities";
import { User } from "../entities/user.entities";
import { Ticket } from "../entities/ticket.entities";
import { AuthRequest } from "../interfaces/auth.interface";
import { HttpError } from "../error/HttpError";

export class MessageService {
  private messageRepository: Repository<Message>;
  private userRepository: Repository<User>;
  private ticketRepository: Repository<Ticket>;

  constructor() {
    this.messageRepository = AppDataSource.getRepository(Message);
    this.userRepository = AppDataSource.getRepository(User);
    this.ticketRepository = AppDataSource.getRepository(Ticket);
  }

  async createMessage(authRequest: AuthRequest, ticketId: string, messageContent: string): Promise<Message> {
    if(!authRequest.user) throw new Error("User not authenticated")

    const user = await this.userRepository.findOne({ where: { id: authRequest.user.id } });
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new HttpError("Ticket not found", 404);
    }

    if (ticket.status === "closed") {
      throw new HttpError("Cannot add message to a closed ticket", 400);
    }

    const message = new Message();
    message.user = user;
    message.ticket = ticket;
    message.message = messageContent;

    return await this.messageRepository.save(message);
  }

  async getMessageById(id: string, req: AuthRequest): Promise<Message> {
    if (!req.user) throw new Error("User not found");

    const message = await this.messageRepository.findOne({
      where: { id, user: { id: req.user.id } },
      relations: ["user", "ticket"],
    });
    if (!message) throw new Error("Can't access message");

    return message;
  }

  async getMessagesByTicket(ticketId: string, req: AuthRequest): Promise<Message[]> {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });

    if (!ticket) {
      throw new HttpError("Ticket not found", 404);
    }
    if (req.user !== ticket.opened_by || req.user.role !== 'admin') throw new Error("Unauthorized access")

    return await this.messageRepository.find({
      where: { ticket: { id: ticketId }},
      relations: ["user", "ticket"],
      order: { created_at: "ASC" },
    });
  }

  // Get all messages for a user
  async getMessagesByUser(userId: string): Promise<Message[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    return await this.messageRepository.find({
      where: { user: { id: userId } },
      relations: ["user", "ticket"],
      order: { created_at: "ASC" },
    });
  }

  async deleteMessage(id: string): Promise<void> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new HttpError("Message not found", 404);
    }
    await this.messageRepository.remove(message);
  }
}
import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { AuthRequest } from "interfaces/auth.interface";
import { HttpError } from "../error/HttpError";
import { CustomAsset } from "../entities/customasset.entities";
import { Ticket } from "../entities/ticket.entities";

export class TicketService {
  private ticketRepository: Repository<Ticket>;
  private customAssetRepository: Repository<CustomAsset>;

  constructor() {
    this.ticketRepository = AppDataSource.getRepository(Ticket);
    this.customAssetRepository = AppDataSource.getRepository(CustomAsset);
  }

  // Create a new ticket
  async createTicket(
    req: AuthRequest,
    customAssetId?: string
  ): Promise<Ticket> {
  
    if (!req.user) {
      throw new HttpError( "User not found", 404);
    }

    const ticket = new Ticket();
    ticket.opened_by = req.user;
    ticket.name = req.body.name
    ticket.description = req.body.description

    if (customAssetId) {
      const customAsset = await this.customAssetRepository.findOne({
        where: { id: customAssetId },
      });
      if (!customAsset) {
        throw new HttpError( "Custom asset not found", 404);
      }
      ticket.custom_asset = customAsset;
    }

    return await this.ticketRepository.save(ticket);
  }

  // Get a ticket by ID
async getTicketById(id: string, req: AuthRequest): Promise<Ticket> {
  if (!req.user) throw new Error("User not found");
  let ticket: Ticket | null

  if (req.user && req.user.role === 'admin'){
    ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ["opened_by", "custom_asset"],
    });
    if (!ticket) {
      throw new HttpError("Ticket not found or unauthorized", 404);
    }
    return ticket;
  }

  ticket = await this.ticketRepository.findOne({
    where: { id, opened_by: { id: req.user.id } },
    relations: ["opened_by", "custom_asset"],
  });

  if (!ticket) {
    throw new HttpError("Ticket not found or unauthorized", 404);
  }
  return ticket;
}

  // Get all tickets for a user
  async getUserTickets(req: AuthRequest): Promise<Ticket[]> {
    if (!req.user){
        throw new Error("User not found")
    }
    if (req.user && req.user.role === "admin"){
      return await this.ticketRepository.find({
        where: { opened_by: { id: req.body.userId } },
        relations: ["opened_by", "custom_asset"],
      });
    }
    return await this.ticketRepository.find({
      where: { opened_by: { id: req.user.id } },
      relations: ["opened_by", "custom_asset"],
    });
  }

  // Get all tickets (optionally filtered by status)
  async getAllTickets(status?: "open" | "closed"): Promise<Ticket[]> {
    const query: any = {};
    if (status) {
      query.status = status;
    }
    return await this.ticketRepository.find({
      where: query,
      relations: ["opened_by", "custom_asset"],
    });
  }

  // Update ticket status
  async updateTicketStatus(id: string, status: "open" | "closed"): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new HttpError( "Ticket not found", 404);
    }
    
    ticket.status = status;
    return await this.ticketRepository.save(ticket);
  }

  // Delete a ticket
  async deleteTicket(id: string): Promise<void> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new HttpError("Ticket not found", 404);
    }
    await this.ticketRepository.remove(ticket);
  }
}
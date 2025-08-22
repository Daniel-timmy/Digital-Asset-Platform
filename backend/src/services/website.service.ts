import { AppDataSource } from "../database/db";
import { Repository, In } from "typeorm";
import { Website } from "../entities/website.entities";
import { User } from "../entities/user.entities";
import { AuthRequest } from "../interfaces/auth.interface";


export class WebsiteService {
  private websiteRepository: Repository<Website>;
  private userRepository: Repository<User>;

  constructor() {
    this.websiteRepository = AppDataSource.getRepository(Website);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(req: AuthRequest): Promise<Website> {
    const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
    // if (!user) throw new Error("User not found");

    const data = req.body;

    const websiteData = {
      description: data.description,
      company_name: data.company_name,
      industry: data.industry,
      contact_email: data.contact_email,
      website_type: data.website_type,
      features: data.features,
      user: user ? user : undefined,
    };

    const website = this.websiteRepository.create(websiteData);
    return await this.websiteRepository.save(website);
  }

  async findByUserId(userId: string): Promise<Website[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    return await this.websiteRepository.find({ where: { user } });
  }

  async findAll(): Promise<Website[]> {
    return await this.websiteRepository.find();
  }

  async findById(id: string, req: AuthRequest): Promise<Website> {
    if (req.user && req.user.role === "admin") {
      const website = await this.websiteRepository.findOne({ where: { id } });
      if (!website) throw new Error("Website not found");
      return website;
    }
    if (!req.user) throw new Error("User not authenticated");
    const user = await this.userRepository.findOne({ where: { id: req.user.id } });
    if (!user) throw new Error("User not found");
    const website = await this.websiteRepository.findOne({ where: { id, user } });
    if (!website) throw new Error("Website service not found for this user");

    return website;
  }

  async update(id: string, req: AuthRequest): Promise<Website>{
    const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
    if (!user) throw new Error("User not found");

    const website = await this.websiteRepository.findOne({ where: { id, user } });
    if (!website) throw new Error("Website not found");

    const data = req.body;

    website.description = data.description || website.description;
    website.company_name = data.company_name || website.company_name;
    website.industry = data.industry || website.industry;
    website.contact_email = data.contact_email || website.contact_email;

    return await this.websiteRepository.save(website);
  }

    async delete(id: string, req: AuthRequest): Promise<void> {
        const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
        if (!user) throw new Error("User not found");
    
        const website = await this.websiteRepository.findOne({ where: { id, user } });
        if (!website) throw new Error("Website not found");
    
        await this.websiteRepository.remove(website);
    }
}
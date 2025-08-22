import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { Social } from "../entities/socialMedia.entities";
import { User } from "../entities/user.entities";
import { AuthRequest } from "../interfaces/auth.interface";

export class SocialMediaService {
  private socialRepository: Repository<Social>;
  private userRepository: Repository<User>;

  constructor() {
    this.socialRepository = AppDataSource.getRepository(Social);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(req: AuthRequest): Promise<Social> {
    const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;

    const data = req.body;

    const socialData = {
      company_name: data.company_name,
      description: data.description,
      audience: data.audience,
      contact_email: data.contact_email,
      preferred_contact_method: data.preferred_contact_method,
      contact_means: data.contact_means,
      user: user ? user : undefined,
    };

    const socialMedia = this.socialRepository.create(socialData);
    return await this.socialRepository.save(socialMedia);
  }

  async findByUserId(userId: string): Promise<Social[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    return await this.socialRepository.find({ where: { user } });
  }

  async findAll(): Promise<Social[]> {
    return await this.socialRepository.find();
  }

  async findById(id: string, req: AuthRequest): Promise<Social> {
    if (req.user && req.user.role === "admin") {
      const socialMedia = await this.socialRepository.findOne({ where: { id } });
      if (!socialMedia) throw new Error("Social media not found");
      return socialMedia;
    }
    if (!req.user) throw new Error("User not authenticated");
    const user = await this.userRepository.findOne({ where: { id: req.user.id } });
    if (!user) throw new Error("User not found");
    const socialMedia = await this.socialRepository.findOne({ where: { id, user } });
    if (!socialMedia) throw new Error("Social media not found for this user");

    return socialMedia;
  }

  async update(id: string, req: AuthRequest): Promise<Social> {
    const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
    if (!user) throw new Error("User not found");

    const socialMedia = await this.socialRepository.findOne({ where: { id, user } });
    if (!socialMedia) throw new Error("Social media not found");

    const data = req.body;

    socialMedia.company_name = data.company_name || socialMedia.company_name;
    socialMedia.description = data.description || socialMedia.description;
    socialMedia.audience = data.audience || socialMedia.audience;
    socialMedia.contact_email = data.contact_email || socialMedia.contact_email;
    socialMedia.preferred_contact_method = data.preferred_contact_method || socialMedia.preferred_contact_method;
    socialMedia.contact_means = data.contact_means || socialMedia.contact_means;

    return await this.socialRepository.save(socialMedia);
  }

  async delete(id: string, req: AuthRequest): Promise<void> {
    const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
    if (!user) throw new Error("User not found");

    const socialMedia = await this.socialRepository.findOne({ where: { id, user } });
    if (!socialMedia) throw new Error("Social media not found");

    await this.socialRepository.remove(socialMedia);
  }
}
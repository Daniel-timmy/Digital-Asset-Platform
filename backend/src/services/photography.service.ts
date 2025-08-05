import { AppDataSource } from "../database/db";
import { Repository, In } from "typeorm";
import { Photography } from "../entities/photography.entities";
import { User } from "../entities/user.entities";
import { AuthRequest } from "../interfaces/auth.interface";
import { HttpError } from "../error/HttpError";

export class PhotographyService {
    private photographyRepository: Repository<Photography>;
    private userRepository: Repository<User>;
    
    constructor() {
        this.photographyRepository = AppDataSource.getRepository(Photography);
        this.userRepository = AppDataSource.getRepository(User);
    }
    
    async create(req: AuthRequest): Promise<Photography> {
        const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
        if (!user) throw new HttpError("User not found", 404);
    
        const data = req.body;
    
        const photographyData = {
        picture_type: data.picture_type,
        event_type: data.event_type,
        description: data.description,
        contact: data.contact,
        event_date: data.event_date,
        user,
        };
    
        const photography = this.photographyRepository.create(photographyData);
        return await this.photographyRepository.save(photography);
    }
    
    async findByUserId(req: AuthRequest): Promise<Photography[]> {
        if (!req.user) throw new HttpError("User not authenticated", 401);
        const user = await this.userRepository.findOne({ where: { id: req.user.id } });
        if (!user) throw new HttpError("User not found", 404);
    
        return await this.photographyRepository.find({ where: { user } });
    }
    
    async findAll(): Promise<Photography[]> {
        return await this.photographyRepository.find();
    }
    
    async findById(id: string, req: AuthRequest): Promise<Photography> {
        if (req.user && req.user.role === "admin") {
        const photography = await this.photographyRepository.findOne({ where: { id } });
        if (!photography) throw new HttpError("Photography not found", 404);
        return photography;
        }
        if (!req.user) throw new HttpError("User not authenticated", 401);
    
        const user = await this.userRepository.findOne({ where: { id: req.user.id } });
        if (!user) throw new HttpError("User not found", 404);
        
        const photography = await this.photographyRepository.findOne({ where: { id, user } });
        if (!photography) throw new HttpError("Photography service not found for this user", 404);
    
        return photography;
    }
    
}
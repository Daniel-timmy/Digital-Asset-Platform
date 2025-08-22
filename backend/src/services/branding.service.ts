import { AppDataSource } from "../database/db";
import { Repository, In } from "typeorm";
import { Branding } from "../entities/branding.entities";
import { User } from "../entities/user.entities";
import { AuthRequest } from "../interfaces/auth.interface";
import { HttpError } from "../error/HttpError";


export class BrandingService {
    private brandingRepository: Repository<Branding>;
    private userRepository: Repository<User>;

    constructor() {
        this.brandingRepository = AppDataSource.getRepository(Branding);
        this.userRepository = AppDataSource.getRepository(User);
    }

    async create(req: AuthRequest): Promise<Branding> {
        const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
        if (!user) throw new HttpError( "User not found", 404);

        // if (user.role !== "admin") throw new HttpError(403, "User not an admin");

        const data = req.body;

        const brandingData = {
            logo: data.logo,
            brand_name: data.brand_name,
            colors: data.colors,
            description: data.description,
            contact_email: data.contact_email,
            preferred_contact_method: data.preferred_contact_method,
            contact_means: data.contact_means,
            user,
        };

        const branding = this.brandingRepository.create(brandingData);
        return await this.brandingRepository.save(branding);
    }

    async findByUserId(userId: string): Promise<Branding[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new HttpError("User not found", 404);

        return await this.brandingRepository.find({ where: { user } });
    }

    async findAll(): Promise<Branding[]> {
        return await this.brandingRepository.find();
    }

    async findById(id: string, req: AuthRequest): Promise<Branding> {
       if (req.user &&  req.user.role === "admin") {
         const branding = await this.brandingRepository.findOne({ where: { id } });
        if (!branding) throw new HttpError("Branding not found", 404);
        return branding;
        }
        if (!req.user) throw new HttpError("User not authenticated", 401);

        const user = await this.userRepository.findOne({ where: { id: req.user.id } });
        if (!user) throw new HttpError("User not found", 404);
        const branding = await this.brandingRepository.findOne({ where: { id, user } });
        if (!branding) throw new HttpError("Branding not found", 404);
        return branding;

}


    async update(id: string, req: AuthRequest): Promise<Branding> {
        if (!req.user) throw new HttpError("User not authenticated", 401);
        const data = req.body;
        const user = await this.userRepository.findOne({ where: { id: req.user.id } });
        if (!user) throw new HttpError("User not found", 404);

        const branding = await this.brandingRepository.findOne({ where: { id, user } });
        if (!branding) throw new HttpError("Branding not found", 404);

        Object.assign(branding, data);
        return await this.brandingRepository.save(branding);
    }


    async delete(id: string, req: AuthRequest): Promise<{ message: string }> {
        if (!req.user) throw new HttpError("User not authenticated", 401);
        const user = await this.userRepository.findOne({ where: { id: req.user.id } });
        if (!user) throw new HttpError("User not found", 404);

        const branding = await this.brandingRepository.findOne({ where: { id, user } });
        if (!branding) throw new HttpError("Branding not found", 404);

        await this.brandingRepository.remove(branding);
        return { message: "Branding deleted successfully" };
    }
}
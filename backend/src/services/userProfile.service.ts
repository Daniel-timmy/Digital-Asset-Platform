import { UserProfile } from "../entities/userProfile.entities";
import { AppDataSource } from "../database/db";
import { Repository } from "typeorm";
import { HttpError } from "../error/HttpError";
import logger from "../logger/app.logger";
import rabbitMq from "../queue/rabbitMq";
import { AuthRequest } from "../interfaces/auth.interface";
import { USER_PROFILE_QUEUE } from "../config/env";
import { User } from "../entities/user.entities";


export class UserProfileService {
  private userProfileRepository: Repository<UserProfile>;
  private userRepository: Repository<User>;

  constructor() {
    this.userProfileRepository = AppDataSource.getRepository(UserProfile)
    this.userRepository = AppDataSource.getRepository(User)
  }

  async create(user: User) {
    const profile = this.userProfileRepository.create({ user: user })
    const savedProfile = await this.userProfileRepository.save(profile)

    return savedProfile
  }

  async getById(id: string) {
    return await this.userProfileRepository.findOne({
      where: { id },
      relations: ["user"],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          created_at: true
        }
      }
    });
  }
  async getByUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpError("You are not authorized to get this profile", 403);
    }
    if (user.status == "deleted") {
      throw new HttpError("The profile for this user does not exist", 404);
    }
    let profile = await this.userProfileRepository.findOne({
      where: { user: { id } },
      relations: ["user"],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          created_at: true
        }
      }
    });

    return profile;
  }

  async update(id: string, req: AuthRequest) {
    if (!req.user) {
      throw new HttpError("You are not authorized to update this profile", 403);
    }
    if (req.user.status == "deleted") {
      throw new HttpError("The profile for this user does not exist", 404);
    }
    let profile = await this.userProfileRepository.findOne({ where: { user: { id: req.user.id } } });

    console.log(profile)
    if (!profile) throw new HttpError('Profile not found', 404);

    const profileData: Partial<UserProfile> = {
      user: req.user,
      phone: req.body.phone,
      address: req.body.address,
      description: req.body.description,
      instagram: req.body.instagram,
      x: req.body.x,
      facebook: req.body.facebook,
      title: req.body.title,
      interest: req.body.interest,
    }

    Object.assign(profile, profileData);
    const savedProfile = await this.userProfileRepository.save(profile);

    const files = req.files as { profileImage?: Express.Multer.File[]; coverImage?: Express.Multer.File[] };
    const profileImage = files.profileImage?.[0];
    const coverImage = files.coverImage?.[0];
    console.log(profileImage)

    if (profileImage) {
      const profileImageExt = profileImage.originalname.split('.').pop();
      const profileImageName = `${savedProfile.id}-avatar.${profileImageExt}`;

      await rabbitMq.publishUpdates(USER_PROFILE_QUEUE, profileImage.buffer, {
        type: 'avatar',
        userProfileId: savedProfile.id,
        filename: profileImageName
      });
    }

    if (coverImage) {
      const coverImageExt = coverImage.originalname.split('.').pop();
      const coverImageName = `${savedProfile.id}-cover.${coverImageExt}`;

      await rabbitMq.publishUpdates(USER_PROFILE_QUEUE, coverImage.buffer, {
        type: 'cover',
        userProfileId: savedProfile.id,
        filename: coverImageName
      });
    }

    return savedProfile;
  }

  async delete(id: string) {
    await this.userProfileRepository.delete(id);
  }
  async save(profile: UserProfile) {
    return await this.userProfileRepository.save(profile);
  }
}

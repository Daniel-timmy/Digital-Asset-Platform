import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../interfaces/auth.interface";
import { CustomAssetService } from "../services/customasset.service";
import logger from "../logger/app.logger";
import CustomAssetError from "../error/CustomAssetError";

interface ICustomAsset {
    description?: string;
    custom_url?: string;
    status?: "open" | "closed" | "cancelled";
}

export class CustomAssetController {
    constructor(private customAssetService: CustomAssetService) {}


    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                logger.warn('Unauthorized attempt to create custom asset');
                throw new CustomAssetError(401, 'Unauthorized');
            }

            logger.info(`Creating new custom asset for user: ${req.user.id}`);
            const { name, description, asset } = req.body;

            if (!name) {
                logger.warn(`Create asset failed: Missing name for user ${req.user.id}`);
                throw new CustomAssetError(400, 'Name is required');
            }
            if (!description) {
                logger.warn(`Create asset failed: Missing description for user ${req.user.id}`);
                throw new CustomAssetError(400, 'Description is required');
            }
            if (!asset) {
                logger.warn(`Create asset failed: No asset template chosen for user ${req.user.id}`);
                throw new CustomAssetError(400, 'Asset template is required');
            }

            const customAsset = await this.customAssetService.create(req);
            logger.info(`Successfully created custom asset with ID: ${customAsset.id} for user: ${req.user.id}`);
            return res.status(201).json({
                success: true,
                data: customAsset,
                message: 'Custom asset created successfully'
            });
        } catch (error) {
            logger.error(`Error creating custom asset for user ${req.user?.id || 'unknown'}: ${error}`);
            next(error);
        }
    }

    async findAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                logger.warn('Unauthorized access attempt to fetch all custom assets');
                throw new CustomAssetError(401, 'Unauthorized');
            }

            logger.info(`Fetching custom assets for user: ${req.user.id}, role: ${req.user.role}`);
            const filteredAssets = await this.customAssetService.findAll(req)
            logger.info(`Successfully retrieved ${filteredAssets.results.length} custom assets for user: ${req.user.id}`);

            return res.status(200).json({
                success: true,
                data: filteredAssets,
                message: 'Custom assets retrieved successfully'
            });
        } catch (error) {
            logger.error(`Error fetching custom assets for user ${req.user?.id || 'unknown'}: ${error}`);
            next(error);
        }
    }

    async getCountByPaymentStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                logger.warn('Unauthorized attempt to fetch payment status counts');
                throw new CustomAssetError(401, 'Unauthorized');
            }

            logger.info(`Fetching custom asset payment status counts for user: ${req.user.id}`);
            const customAssetsCounts = await this.customAssetService.getCustomAssetPaymentStatusCounts(req);
            logger.info(`Successfully retrieved payment status counts for user: ${req.user.id}`);

            return res.status(200).json({
                success: true,
                data: customAssetsCounts,
                message: 'Payment status counts retrieved successfully'
            });
        } catch (error) {
            logger.error(`Error fetching payment status counts for user ${req.user?.id || 'unknown'}: ${error}`);
            next(error);
        }
    }

    async findById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                logger.warn('Unauthorized attempt to fetch custom asset');
                throw new CustomAssetError(401, 'Unauthorized');
            }
            const id = req.params.id;

            logger.info(`Fetching custom asset with ID: ${id} for user: ${req.user.id}`);
            const customAsset = await this.customAssetService.findOne(req, id);
            if (!customAsset) {
                logger.warn(`Custom asset not found with ID: ${id} for user: ${req.user.id}`);
                throw new CustomAssetError(404, 'Custom asset not found');
            }

            logger.info(`Successfully retrieved custom asset with ID: ${id}`);
            return res.status(200).json({
                success: true,
                data: customAsset,
                message: 'Custom asset retrieved successfully'
            });
        } catch (error) {
            logger.error(`Error fetching custom asset with ID: ${req.params.id} for user ${req.user?.id || 'unknown'}: ${error}`);
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.user
            if (!user ||  user.role !== "admin") {
                logger.warn('Unauthorized attempt to update custom asset');
                throw new CustomAssetError(401, 'Unauthorized');
            }
            const id = req.params.id;
            logger.info(`Updating custom asset with ID: ${id} for user: ${user.id}`);
            const {description, custom_url, status} = req.body
            const updateData: ICustomAsset = {}
            if (description){
                updateData.description = description
                logger.debug(`Updating description for custom asset ID: ${id}`);
            }
            if (custom_url){
                updateData.custom_url = custom_url
                logger.debug(`Updating custom_url for custom asset ID: ${id}`);
            }
            if (status){
                updateData.status = status
                logger.debug(`Updating status for custom asset ID: ${id}`);

            }

            const customAsset = await this.customAssetService.update(id, updateData);
            if (!customAsset) {
                logger.warn(`Custom asset not found for update with ID: ${id} for user: ${user.id}`);
                throw new CustomAssetError(404, 'Custom asset not found');
            }
        

            logger.info(`Successfully updated custom asset with ID: ${id}`);
            return res.status(200).json({
                success: true,
                data: customAsset,
                message: 'Custom asset updated successfully'
            });
        } catch (error) {
            logger.error(`Error updating custom asset with ID: ${req.params.id} for user ${req.user?.id || 'unknown'}: ${error}`);
            next(error);
        }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                logger.warn('Unauthorized attempt to delete custom asset');
                throw new CustomAssetError(401, 'Unauthorized');
            }

            const id = req.params.id;

            logger.info(`Deleting custom asset with ID: ${id} for user: ${req.user.id}`);
            const result = await this.customAssetService.remove(id, req);

            logger.info(`Successfully deleted custom asset with ID: ${id}`);
            return res.status(204).json({
                success: true,
                message: 'Custom asset deleted successfully'
            });
        } catch (error) {
            logger.error(`Error deleting custom asset with ID: ${req.params.id} for user ${req.user?.id || 'unknown'}: ${error}`);
            next(error);
        }
    }

    async count(req:Request, res: Response, next: NextFunction){
        try{
          const count = await this.customAssetService.countActiveRequests()
          res.status(200).json({count})
        } catch (error){
          next(error)
        }
      }
}
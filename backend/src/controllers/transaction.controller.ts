import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import axios from 'axios';
import { Repository, In } from "typeorm";
import { TransactionService } from "../services/transaction.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { Transaction } from "../entities/transaction.entities";
import { FRONTEND_URL, PAYSTACK_SECRET_KEY } from "../config/env";
import { User } from "../entities/user.entities";
import { Asset } from "../entities/asset.entities";
import { Download } from "../entities/download.entities";
import { AppDataSource } from "../database/db";
import { verifyPayment } from "../utils/payment";
import logger from "../logger/app.logger";
import { HttpError } from "../error/HttpError";
import { applyTransactionsFilters } from "../filters/transactions.filter";
import { redisClient } from "../database/redis_cache";
import { DownloadService } from "../services/download.service";


export class TransactionController {
  private userRepository: Repository<User>;
  private transactionRepository: Repository<Transaction>;
  private downloadRepository: Repository<Download>
  private downloadService: DownloadService;
  private assetRepository: Repository<Asset>;

  constructor(private transactionService: TransactionService) {
    this.userRepository = AppDataSource.getRepository(User);
    this.transactionRepository = AppDataSource.getRepository(Transaction);
    this.downloadRepository = AppDataSource.getRepository(Download)
    this.downloadService = new DownloadService()
    this.assetRepository = AppDataSource.getRepository(Asset);
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      logger.info(`Creating transaction for user: ${req.user?.id || 'unknown'}`);
      const data = req.body;
      const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
      if (!user) {
        logger.warn(`Transaction creation failed: User not found for ID: ${req.user?.id || 'unknown'}`);
        throw new Error("User not found");
      }

      const transaction = await this.transactionService.create(data);
      logger.info(`Successfully created transaction with ID: ${transaction[0].id} for user: ${req.user?.id}`);
      res.status(201).json(transaction);
    } catch (error) {
      logger.error(`Error creating transaction for user ${req.user?.id || 'unknown'}: ${error}`);
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
          logger.warn('Unauthorized access attempt to fetch all custom assets');
          throw new HttpError('Unauthorized', 401);
      }
      logger.info(`Fetching all transactions`);

      const filters = req.query;
      let query = AppDataSource.getRepository(Transaction)
          .createQueryBuilder("transaction")
          .leftJoinAndSelect("transaction.user", "user")
            
      if (req.user && req.user.role !== 'admin') {
          filters.userId = { userId: req.user.id };
          query = query.andWhere("transaction.user_id = :userId", { userId: req.user.id });
          logger.debug(`Applying user filter for non-admin user: ${req.user.id}`);
      }
      const transactions = await applyTransactionsFilters(query, filters)
      // const transactions = await this.transactionService.findAll()

      
      logger.info(`Successfully retrieved ${transactions.limit} transactions`);
      res.status(200).json(transactions);
    } catch (error) {
      logger.error(`Error fetching all transactions: ${error}`);
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Fetching transaction with ID: ${id}`);
      const transaction = await this.transactionService.findOne(id);
      if (!transaction) {
        logger.warn(`Transaction not found with ID: ${id}`);
        return res.status(404).json({ error: "Transaction not found" });
      }
      logger.info(`Successfully retrieved transaction with ID: ${id}`);
      res.json(transaction);
    } catch (error) {
      logger.error(`Error fetching transaction with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Updating transaction with ID: ${id}`);
      const transaction = await this.transactionService.update(id, req.body);
      if (!transaction) {
        logger.warn(`Transaction not found for update with ID: ${id}`);
        return res.status(404).json({ error: "Transaction not found" });
      }
      logger.info(`Successfully updated transaction with ID: ${id}`);
      res.json(transaction);
    } catch (error) {
      logger.error(`Error updating transaction with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }

  async totalSales(req: Request, res: Response, next: NextFunction){
    const sales = await this.transactionService.getTotalSales()
    res.json(sales)
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      logger.info(`Deleting transaction with ID: ${id}`);
      const transaction = await this.transactionService.findOne(id);
      if (!transaction) {
        logger.warn(`Transaction not found for deletion with ID: ${id}`);
        return res.status(404).json({ error: "Transaction not found" });
      }
      await this.transactionService.remove(id);
      logger.info(`Successfully deleted transaction with ID: ${id}`);
      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting transaction with ID: ${req.params.id}: ${error}`);
      next(error);
    }
  }

 async initialize(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // take in all the assets to be bought and cache them with redis
      logger.info(`Initializing payment for user: ${req.user?.id || 'unknown'}`);
      const user = req.user;
      if (!user) {
        logger.warn(`Payment initialization failed: User unauthenticated`);
        throw new Error("User unauthenticated");
      }
      const { assetIds } = req.body;
      if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
        logger.warn(`Payment initialization failed: No assets provided by user: ${user.id}`);
        throw new Error("No assets provided");
      }

      const assetRecords = await this.assetRepository.find({
        where: { id: In(assetIds) },
        select: ["id", "price"],
      });
      if (assetRecords.length !== assetIds.length) {
        logger.warn(`Payment initialization failed: One or more assets not found for user: ${user.id}`);
        throw new Error("One or more assets not found");
      }
      const totalAmount = assetRecords.reduce((sum, asset) => sum + (Number(asset.price) || 0), 0);

      const transactionData = {
        user,
        amount: totalAmount,
      };
      
      const transaction = this.transactionRepository.create(transactionData);
      const savedTransaction = await this.transactionRepository.save(transaction);
      // improve on this
      await (await redisClient).set(
        savedTransaction.id,
        JSON.stringify({ assets: assetIds }),
        {
          EX: 36000,
          NX: true,
        }
      );
      logger.info(`Created transaction with ID: ${savedTransaction.id} for user: ${user.id}, total amount: ${totalAmount}`);

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: user.email,
          amount: totalAmount * 100,
          reference: savedTransaction.id,
          callback_url: `${FRONTEND_URL}/verify-payment`,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      logger.info(`Initialized Paystack payment for transaction ID: ${savedTransaction.id}, user: ${user.id}`);

      if (response.status){
        savedTransaction.payment_status = "processing"
        await this.transactionRepository.save(savedTransaction)
      }
        res.status(200).json({
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
      });
    } catch (error) {
      logger.error(`Error initializing payment for user ${req.user?.id || 'unknown'}: ${error}`);
      res.status(500).json({ error: 'Failed to initialize payment' });
    }
  }


  async webhook_paystack(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`Received Paystack webhook event: ${req.body.event}`);
      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY!)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== req.headers['x-paystack-signature']) {
        logger.warn(`Invalid Paystack webhook signature`);
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const event = req.body;

      switch (event.event) {
        case 'charge.success':
          const { reference, amount, status } = event.data;
          logger.info(`Processing charge.success for reference: ${reference}, amount: ${amount}`);
          await verifyPayment(reference)
            .then(async (paymentData) => {
              if (paymentData.status === 'success') {
                await this.transactionService.update(reference, { payment_status: "completed" });
                  // if (customasset.type === 'download'){
                  //   const cdownload = this.downloadRepository.create({user: req.user, asset: customasset.asset})
                  //   const download = await this.downloadRepository.save(cdownload)
                  //   console.log(`DOWNLOADDDDDDDDDDDDDDDD ${download.id}`)
                  // }
                logger.info(`Payment successful for reference: ${reference}, amount: ${amount}`);
              } else {
                logger.warn(`Payment verification failed for reference: ${reference}, status: ${paymentData.status}`);
              }
            })
            .catch((error) => {
              logger.error(`Payment verification failed for reference: ${reference}: ${error.message}`);
            });
          break;
        default:
          logger.info(`Unhandled Paystack webhook event: ${event.event}`);
      }

      logger.info(`Acknowledged Paystack webhook for event: ${event.event}`);
      res.status(200).send('Webhook received');
    } catch (error) {
      logger.error(`Error processing Paystack webhook: ${error}`);
      next(error);
    }
  }

  async verify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ref = req.params.ref;
      logger.info(`Verifying payment for transaction reference: ${ref}`);

      const transaction = await this.transactionService.findOne(ref);
      if (!transaction) {
        logger.warn(`Transaction not found for verification with reference: ${ref}`);
        throw new Error("Transaction not found");
      }

      if (transaction.payment_status === "completed") {
        logger.info(`Payment already verified for transaction reference: ${ref}`);
        // check for corresponding download
        return res.status(200).json({
          message: "Payment already verified",
          transaction,
        });
      }

      let assetData: any 
      const cachedData = await (await redisClient).get(transaction.id);
      if (!cachedData || typeof cachedData !== 'string') {
        logger.warn(` Invalid or expired key: ${transaction.id}`);
        throw new HttpError("Invalid or expired verification code", 400);
      }
      assetData = JSON.parse(cachedData)
      
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${ref}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      logger.info(`Paystack verification response for reference: ${ref}, status: ${response.data.status}`);

      let message;
      let status;
      if (response.data.status === true) {
        const data = response.data.data;

        if (data.status === "success") {
          transaction.payment_status = "completed";
          console.log("ASSET DATA", assetData)
          const downloads = await this.downloadService.batchCreate(assetData.assets, transaction, req.user)
          message = "Payment processed successfully";
          status = "success";
          logger.info(`Payment verified as successful for reference: ${ref}`);
        } else if (data.status === "failed") {
          transaction.payment_status = "failed";
          message = "Payment failed";
          status = "failed";
          logger.warn(`Payment failed for reference: ${ref}`);
        } else if (data.status === "processing") {
          transaction.payment_status = "processing";
          status = "processing";
          message = "Payment is still processing";
          logger.info(`Payment still processing for reference: ${ref}`);
        } else if (data.status === "abandoned") {
          transaction.payment_status = "failed";
          message = "Payment was abandoned";
          status = "failed";
          logger.warn(`Payment abandoned for reference: ${ref}`);
        } else {
          transaction.payment_status = "pending";
          message = "Payment still pending";
          status = "failed";
          logger.info(`Payment pending for reference: ${ref}`);
        }

        const savedTransaction = await this.transactionRepository.save(transaction);
        logger.info(`Updated transaction reference: ${ref}, transaction status: ${transaction.payment_status}`);

        return res.status(200).json({
          message,
          savedTransaction,
          status,
        });
      } else {
        logger.warn(`Paystack verification failed for reference: ${ref}`);
        return res.status(400).json({
          message: "Payment failed",
        });
      }
    } catch (error) {
      logger.error(`Error verifying payment for reference: ${req.params.ref}: ${error}`);
      next(error);
    }
  }
}



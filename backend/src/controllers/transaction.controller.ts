import { NextFunction, Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { Repository, In } from "typeorm";
import axios from 'axios'
import { FRONTEND_URL, PAYSTACK_SECRET_KEY } from "../config/env";
import { User } from "../entities/user.entities";
import { CustomAsset } from "../entities/customasset.entities";
import { AppDataSource } from "../database/db";
import { verifyPayment } from "../utils/payment";
import crypto from "crypto"




export class TransactionController {
      private customAssetRepository: Repository<CustomAsset>
      private userRepository: Repository<User>;

  constructor(private transactionService: TransactionService) {
      this.customAssetRepository = AppDataSource.getRepository(CustomAsset);
      this.userRepository = AppDataSource.getRepository(User);
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const user = req.user ? await this.userRepository.findOne({ where: { id: req.user.id } }) : null;
      if (!user) throw new Error("User not found");

      const customAsset = req.body ? await this.customAssetRepository.findOne({where: {id : req.body.asset }}) : null;
      if (!customAsset) throw new Error("Asset not found")

      const transaction = await this.transactionService.create(data);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const transactions = await this.transactionService.findAll();
      res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await this.transactionService.findOne(req.params.id);
      if (!transaction) return res.status(404).json({ error: "Transaction not found" });
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await this.transactionService.update(req.params.id, req.body);
      if (!transaction) return res.status(404).json({ error: "Transaction not found" });
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await this.transactionService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async initialize(req: AuthRequest, res: Response, next: NextFunction){
    try {

      const { email, amount, id } = req.body; // Amount in kobo (e.g., 1000 NGN = 100000 kobo)
      if (!email || !amount) {
        return res.status(400).json({ error: 'Email and amount are required' });
      }
      const custom_asset = await this.customAssetRepository.findOne(id)
      if (!custom_asset) throw new Error('Invalid custom asset id')

      const user = req.user
      const transactionData = {
        custom_asset,
        user,
        amount,

      }
      const transaction = await this.transactionService.create(transactionData)

    
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amount * 100, // Convert to kobo
          reference: transaction[0].id,
          callback_url: `http://${FRONTEND_URL}/verify-payment`, // URL to redirect after payment
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
        res.status(200).json({
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
      });
    } catch (error) {
      console.error('Error initializing payment:', error);
      res.status(500).json({ error: 'Failed to initialize payment' });
    }
  }
  async webhook_paystack(req: Request, res: Response, next: NextFunction) {
    // Verify Paystack signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle the event
    switch (event.event) {
      case 'charge.success':
        const { reference, amount, status } = event.data;
        // Verify payment with Paystack API
        verifyPayment(reference)
          .then((paymentData) => {
            if (paymentData.status === 'success') {
              // Update your database or perform other actions
              const transaction = this.transactionService.update(reference, {payment_status: "completed"})
              console.log(`Payment successful for reference: ${reference}, Amount: ${amount}`);
              // Example: Save to database, send confirmation email, etc.
            }
          })
          .catch((error) => {
            console.error('Payment verification failed:', error);
          });
        break;
      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    // Acknowledge receipt of webhook
    res.status(200).send('Webhook received');
}
}

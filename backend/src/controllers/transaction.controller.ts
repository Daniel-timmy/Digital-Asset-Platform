import { NextFunction, Request, Response } from "express";
import { TransactionService } from "../services/transaction.service";
import { AuthRequest } from "../interfaces/auth.interface";
import { Repository, In } from "typeorm";
import { Transaction } from "../entities/transaction.entities";
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
      private transactionRepository: Repository<Transaction>

  constructor(private transactionService: TransactionService) {
      this.customAssetRepository = AppDataSource.getRepository(CustomAsset);
      this.userRepository = AppDataSource.getRepository(User);
      this.transactionRepository = AppDataSource.getRepository(Transaction)
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
      const user = req.user

      if (!user) throw new Error("User unauthenticated")

      const { id } = req.body; 

      console.log(id)
      const custom_asset = await this.customAssetRepository.findOne({ where: { id: id } })
      if (!custom_asset) throw new Error('Invalid custom asset id')
      console.log(custom_asset)
      const transactionData = {
        custom_asset,
        user,
        amount: custom_asset.price,

      }
      const transaction = this.transactionRepository.create(transactionData);
      const savedTransaction = await this.transactionRepository.save(transaction)
      console.log(savedTransaction.id)

    
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: user.email,
          amount: custom_asset.price * 100, // Convert to kobo
          reference: savedTransaction.id,
          callback_url: `${FRONTEND_URL}/verify-payment`, // URL to redirect after payment
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response.data)
      if (response.status){
        custom_asset.payment_status = "processing"
        await this.customAssetRepository.save(custom_asset)
      }
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

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
    const ref = req.params.ref  
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${ref}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response)
    const transaction = await this.transactionService.findOne(ref)
    if (!transaction) throw new Error("Transaction not found")
    
    const customasset = await this.customAssetRepository.findOne({ where: { id: transaction.custom_asset.id } })
    if (!customasset) throw new Error("Custom asset not found")


    let message;
    let status;
    if (response.status === 200){
      const data = response.data.data;
      if (data.status === "success"){
        transaction.payment_status ="completed"
        customasset.payment_status = "paid"
        message = "Payment processed successfully"
        status = "success"

      } else if (data.status === "failed"){
        transaction.payment_status = "failed"
        message = "Payment failed"
        status ="failed"
      } else if (data.status === "processing") {
        transaction.payment_status = "pending"
        status ="processing"
        message = "Payment is still processing"
      } else if (data.status === "abandoned") {
        transaction.payment_status = "failed"
        customasset.payment_status = "pending"
        message = "Payment was abandoned"
      } else {
        transaction.payment_status = "pending"
        customasset.payment_status = "pending"
        message = "Payment still pending"
        status = "failed"
      }
      const savedTransaction = await this.transactionRepository.save(transaction)
      res.status(200).json({
        message,
        savedTransaction,
        status,
      })
    } else {
       res.status(400).json({
        message: "Payment failed"
      })
    }

  } catch (error) {
    next(error)
  }
  }
}

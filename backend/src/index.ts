import "reflect-metadata";
import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import downloadRouter from "./routes/download.routes";
import transactionRouter from "./routes/transaction.routes";
import assetRouter from "./routes/asset.routes";
import userRouter from "./routes/user.routes";
import licenseRouter from "./routes/license.routes";
import tagRouter from "./routes/tag.routes";
import categoryRouter from "./routes/category.routes";
import customAssetRouter from "./routes/customassets.routes";
import ticketRouter from "./routes/ticket.routes";
import { PORT, FRONTEND_URL } from "../src/config/env";
import { AppDataSource } from "./database/db";
import { errorMiddleware } from "./middlewares/error.middleware";
import messageRouter from "./routes/message.routes";
import rateLimit from 'express-rate-limit';
import cors from "cors"
import path from "path";

const app = express();
app.use('/uploads/thumbnail', express.static(path.join(process.cwd(), 'uploads/thumbnail')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Vite dev server
      `${FRONTEND_URL}`, // Production frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], 
  })
);



const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    statusCode: 429, 
    standardHeaders: true, 
    legacyHeaders: false, 
});

app.use(apiLimiter);


app.use("/api/auth", authRouter);
app.use('/api/category', categoryRouter)
app.use("/api/downloads", downloadRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/assets", assetRouter);
app.use("/api/users", userRouter);
app.use("/api/licenses", licenseRouter);
app.use("/api/tags", tagRouter);
app.use("/api/custom", customAssetRouter)
app.use("/api/ticket", ticketRouter)
app.use("/api/messages", messageRouter)
app.use(errorMiddleware)


const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log(`Database connected`);
    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch(error) {
    
  console.error("Error during Data Source initialization:", error);
  }
}

startServer()
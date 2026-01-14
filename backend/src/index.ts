import "reflect-metadata";
import express, { Request, Response } from 'express';
import cookieParser from "cookie-parser";
import cors from "cors"
import path from "path";
import rateLimit from 'express-rate-limit';
import logger from "./logger/app.logger";
import { morganMiddleware } from "./logger/http.logger";
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
import { redisClient } from "./database/redis_cache";
import { FRONTEND_URL } from "./config/env";
import { initializeDatabase } from "./database/db";
import { errorMiddleware } from "./middlewares/error.middleware";
import messageRouter from "./routes/message.routes";
import userProfileRouter from "./routes/userProfile.routes";
import analyticsRouter from "./routes/analytics.routes";
import { initializeQueues } from "./queue/rabbitMq";


const app = express();
app.use(morganMiddleware)
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
app.set('trust proxy', 1);


app.get('/health', (req: Request, res: Response) => {
  logger.debug('Health check endpoint accessed');
  res.status(200).json({ status: 'OK' });
});
app.use("/api/assets", assetRouter);
app.use("/api/auth", authRouter);
app.use('/api/category', categoryRouter)
app.use("/api/custom", customAssetRouter)
app.use("/api/downloads", downloadRouter);
app.use("/api/licenses", licenseRouter);
app.use("/api/messages", messageRouter)
app.use("/api/tags", tagRouter);
app.use("/api/ticket", ticketRouter)
app.use("/api/transactions", transactionRouter);
app.use("/api/users", userRouter);
app.use("/api/user-profile", userProfileRouter);
app.use("/api/analytics", analyticsRouter);
app.use(errorMiddleware)

if (process.env.PORT === undefined) {
  process.exit(1); // Exit the process with an error code
}

const PORT = parseInt(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    console.log("PORT from config/env:", PORT);
    await initializeDatabase();
    await initializeQueues();

    logger.info('Database connected successfully');
    app.listen(PORT, "0.0.0.0", async () => {
      logger.info(`Server is running on port ${PORT}`);

    });
  } catch (error) {

    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  }
}

startServer()
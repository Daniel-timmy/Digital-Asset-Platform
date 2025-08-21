import { Request, Response, NextFunction } from "express";
import logger from "../logger/app.logger";
import { success } from "zod";

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  try{
  logger.error({ message: err.message, error: err.name, detail: err?.detail })

  res.status(err.statusCode || 500).json({ message: err.message, error: err.name, detail: err?.detail, success: false });
  } catch(error){
    next(error)
  }
}
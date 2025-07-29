import { Request, Response, NextFunction } from "express";

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  try{
 
  res.status(err.statusCode || 500).json({ message: err.message, error: err.name, detail: err?.detail });
  } catch(error){
    next(error)
  }
}
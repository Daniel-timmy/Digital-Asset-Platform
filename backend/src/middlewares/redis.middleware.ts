import { redisClient } from "../database/redis_cache";
import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "interfaces/auth.interface";
import { string } from "zod";

// Define a type for the cached data structure
interface CacheResponse<T = unknown> {
  success: boolean;
  fromCache: boolean;
  data: T;
}

// Define a more specific error type
interface CacheError extends Error {
  message: string;
  stack?: string;
}

export const getCacheMiddleware = async <T>(
  req: AuthRequest,
  res: Response<CacheResponse<T>>,
  next: NextFunction
): Promise<void> => {
  try {
    const cacheKey: string = `cache:${req.params.id}`;
    const cachedData = (await redisClient).get(cacheKey);

    if (typeof cachedData === 'string') {
      res.status(200).json({
        success: true,
        fromCache: true,
        data: JSON.parse(cachedData) as T,
      });
    }
    
    next();
  } catch (error: unknown) {
    const cacheError = error as CacheError;
    console.error(`Cache middleware error: ${cacheError.message}`);
    next(cacheError);
  }
};
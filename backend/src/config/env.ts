import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local`})

// Loads environment variables from process.env
export const DB_URI = process.env.DB_URI;
export const NODE_ENV = process.env.NODE_ENV;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // Default to 1 day if not set
export const PORT = process.env.PORT || 3000; // Default to 3000 if not set
export const FRONTEND_URL = process.env.FRONTEND_URL
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
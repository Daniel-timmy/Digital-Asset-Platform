import { DataSource } from "typeorm";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME, DB_TYPE } from "../config/env";

export const AppDataSource = new DataSource({
  type: DB_TYPE || "postgres" as any, // Default to postgres if not set
  host: DB_HOST,
  port: 5432,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true, // Set to false in production
  logging: false,
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});
  // logging: ["query", "error"],

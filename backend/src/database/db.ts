import { DataSource } from "typeorm";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME, DB_TYPE, NODE_ENV } from "../config/env";

export const AppDataSource = new DataSource({
  type: DB_TYPE || "postgres" as any, // Default to postgres if not set
  url: process.env.DATABASE_URL,
  host: DB_HOST,
  port: 5432,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  
  synchronize: true, // Set to false in production
  logging: false,
   entities: [
    process.env.NODE_ENV === "production"
      ? "dist/entities/**/*.js"
      : "src/entities/**/*.ts",
  ],
  migrations: [
    process.env.NODE_ENV === "production"
      ? "dist/migrations/**/*.js"
      : "src/migrations/**/*.ts",
  ],
  subscribers: [
    process.env.NODE_ENV === "production"
      ? "dist/subscribers/**/*.js"
      : "src/subscribers/**/*.ts",
  ],
});
  // logging: ["query", "error"],
// import { DataSource } from "typeorm";
// import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME, DB_TYPE, NODE_ENV } from "../config/env";

// export const AppDataSource = new DataSource({
//   type: DB_TYPE || "postgres" as any, // Default to postgres if not set
//   url: process.env.DATABASE_URL,
//   host: DB_HOST,
//   port: 5432,
//   username: DB_USERNAME,
//   password: DB_PASSWORD,
//   database: DB_NAME,
//    ssl: {
//     rejectUnauthorized:   false, 
//   },
//   synchronize: true, // Set to false in production
//   logging: true,
//    entities: [
//     process.env.NODE_ENV === "production"
//       ? "dist/entities/**/*.js"
//       : "src/entities/**/*.ts",
//   ],
//   migrations: [
//     process.env.NODE_ENV === "production"
//       ? "dist/migrations/**/*.js"
//       : "src/migrations/**/*.ts",
//   ],
//   subscribers: [
//     process.env.NODE_ENV === "production"
//       ? "dist/subscribers/**/*.js"
//       : "src/subscribers/**/*.ts",
//   ],
// });
//   // logging: ["query", "error"],

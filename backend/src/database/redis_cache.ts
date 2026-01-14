import { createClient } from "redis";
import { REDIS_URL } from "../config/env";

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (err) {
    console.error("Could not connect to Redis", err);
  }
};

connectRedis();

export { redisClient };
import { createClient } from "redis";
import { REDIS_URL } from "../config/env";

const setupCache = async () => {
    const redisClient = createClient({
      url: REDIS_URL, // Adjust the URL if your Redis server is hosted elsewhere
    });

    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    redisClient.connect();
    if (!redisClient.isOpen) {
      console.warn(`Redis client not connected, skipping cache`);
    } else {
      console.log("Redis connected successfully");
    }
    return redisClient
}

const redisClient = setupCache()

export { redisClient };
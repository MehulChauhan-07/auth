import { createClient } from "redis";
import logger from "../utils/logger.js";

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Handle Redis connection events
redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis client error", { error: err.message });
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error("Failed to connect to Redis", { error: error.message });
  }
})();

export default redisClient;

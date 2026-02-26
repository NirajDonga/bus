import { createClient } from "redis";
import { env } from "./env.js";

export const redisClient = createClient({
    url: env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Redis connected successfully");
    } catch (error) {
        console.error("Redis connection failed:", error);
    }
};
import Redis from "ioredis";
import dotenv from 'dotenv'

dotenv.config();

// Support REDIS_URL (for Upstash/hosted Redis) or individual host/port
const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null
  }
}

const redis = new Redis(getRedisConfig());


redis.on("connect",()=>{
    console.log("Redis connected successfully");
})

redis.on("error",(err)=>{
    console.error("Redis connection failed:", err.message);
})


export default redis;

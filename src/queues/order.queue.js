import { Queue } from 'bullmq'
import dotenv from 'dotenv'

dotenv.config()

// Support REDIS_URL (for Upstash/hosted Redis) or individual host/port
const getConnection = () => {
  if (process.env.REDIS_URL) {
    // Parse the Redis URL for BullMQ (needs object, not string)
    const url = new URL(process.env.REDIS_URL)
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null
    }
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null
  }
}

// create queue
export const orderQueue = new Queue('order-notifications', {
  connection: getConnection(),
  defaultJobOptions: {
    attempts: 3,           // retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 5000          // wait 5s, 10s, 20s between retries
    },
    removeOnComplete: 100, // keep last 100 completed jobs
    removeOnFail: 50       // keep last 50 failed jobs
  }
})

console.log('Order queue initialized')

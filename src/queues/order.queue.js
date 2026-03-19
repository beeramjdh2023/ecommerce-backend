import { Queue } from 'bullmq'
import dotenv from 'dotenv'

dotenv.config()

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
}

// create queue
export const orderQueue = new Queue('order-notifications', {
  connection,
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
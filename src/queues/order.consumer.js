import { Worker } from 'bullmq'
import transporter from '../config/mailer.js'
import { orderConfirmationTemplate, orderStatusUpdateTemplate } from './email.templates.js'
import dotenv from 'dotenv'

dotenv.config()

// Support REDIS_URL (for Upstash/hosted Redis) or individual host/port
const getConnection = () => {
  if (process.env.REDIS_URL) {
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

const worker = new Worker(
  'order-notifications',
  async (job) => {
    const { order, userEmail } = job.data

    let template

    if (job.name === 'order-confirmation') {
      template = orderConfirmationTemplate(order)
    } else if (job.name === 'order-status-update') {
      template = orderStatusUpdateTemplate(order)
    }

    if (!template) {
      throw new Error(`Unknown job type: ${job.name}`)
    }

    // send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: template.subject,
      html: template.html
    })

    console.log(` Email sent to ${userEmail} for job ${job.name}`)
  },
  {
    connection: getConnection(),
    concurrency: 5  // process 5 jobs simultaneously
  }
)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`)
})

worker.on('error', (err) => {
  console.error('Worker error:', err.message)
})

console.log(' Order notification worker started')

export default worker

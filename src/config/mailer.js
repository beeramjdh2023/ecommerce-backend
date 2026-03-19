import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

transporter.verify((err, success) => {
  if (err) {
    console.error('Mailer connection failed:', err.message)
  } else {
    console.log('Mailer connected successfully')
  }
})

export default transporter
import bcrypt from 'bcrypt'
import redis from '../../config/redis.js'
import { findUserByEmail, createUser } from './auth.repository.js'

// generate random 6 digit OTP
const generateOTP = () => { 
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const registerService = async ({ name, email, password }) => {

  // 1. check if email already exists in DB
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw new Error('Email already registered')
  }

  // 2. check if email is already pending verification in Redis
  const pendingUser = await redis.get(`pending_user:${email}`)
  if (pendingUser) {
    throw new Error('OTP already sent to this email. Please verify or wait 10 minutes')
  }

  // 3. hash password
  const password_hash = await bcrypt.hash(password, 10)

  // 4. generate OTP
  const otp = generateOTP()

  // 5. store temporarily in Redis with 10 min TTL
  await redis.setex(
    `pending_user:${email}`,
    600,  // 600 seconds = 10 minutes
    JSON.stringify({ name, email, password_hash, otp })
  )

  // 6. TODO: send OTP via email (we'll add this later)
  // for now just log it so you can test
  console.log(`OTP for ${email}: ${otp}`)

  return { message: 'OTP sent to your email' }
}

export const verifyOTPService = async ({ email, otp }) => {

  // 1. get pending user from Redis
  const pendingData = await redis.get(`pending_user:${email}`)
  if (!pendingData) {
    throw new Error('OTP expired or invalid. Please register again')
  }

  const pendingUser = JSON.parse(pendingData)
  console.log("at 2");
  // 2. check OTP
  if (pendingUser.otp !== otp) {
    throw new Error('Invalid OTP')
  }
console.log("at 3");
  // 3. save user to MySQL
  console.log(pendingUser.name,pendingUser.email,pendingUser.password_hash);
  const user = await createUser({
    name: pendingUser.name,
    email: pendingUser.email,
    password_hash: pendingUser.password_hash
  })
console.log("at 4");
  // 4. delete from Redis
  await redis.del(`pending_user:${email}`)

  return { message: 'Email verified successfully', user }
}
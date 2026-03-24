import bcrypt from 'bcrypt'
import redis from '../../config/redis.js'
import jwt from 'jsonwebtoken'
import { findUserByEmail, createUser, saveRefreshToken, findRefreshToken, deleteRefreshToken, findUserById } from './auth.repository.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../config/jwt.js'


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






export const loginService = async ({ email, password }) => {

  // 1. find user
  const user = await findUserByEmail(email)
  if (!user) {
    throw new Error('Invalid email or password')
  }

  // 2. check account is active
  if (!user.is_active) {
    throw new Error('Your account has been suspended')
  }

  // 3. verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash)
  if (!isPasswordValid) {
    throw new Error('Invalid email or password')  // same message for security
  }

  // 4. generate tokens
  const payload = { id: user.id, email: user.email, role: user.role }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // 5. save refresh token in DB
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  await saveRefreshToken({ token: refreshToken, user_id: user.id, expires_at })

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
}

export const refreshTokenService = async (token) => {

  // 1. check token exists in DB
  const storedToken = await findRefreshToken(token)
  if (!storedToken) {
    throw new Error('Invalid refresh token')
  }

  // 2. verify token signature and expiry
  const decoded = verifyRefreshToken(token)

  // 3. get fresh user data
  const user = await findUserById(decoded.id)
  if (!user || !user.is_active) {
    throw new Error('User not found or suspended')
  }

  // 4. generate new access token
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  })

  return { accessToken }
}

export const logoutService = async (token) => {
  await deleteRefreshToken(token)
  return { message: 'Logged out successfully' }
}


export const resendOTPService = async (email) => {
  // check if pending user exists in Redis
  const pendingData = await redis.get(`pending_user:${email}`)
  if (!pendingData) {
    throw new Error('Session expired. Please register again')
  }

  const data = JSON.parse(pendingData)

  // generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // update Redis with new OTP — reset TTL to 10 minutes
  await redis.setex(
    `pending_user:${email}`,
    600,
    JSON.stringify({ ...data, otp })
  )

  console.log(`New OTP for ${email}: ${otp}`)
  return { message: 'New OTP sent to your email' }
}



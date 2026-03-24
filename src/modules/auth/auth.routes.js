import express from 'express'
import { register, verifyOTP, login,resendOTP, refreshToken, logout } from './auth.controller.js'
import { rateLimiter } from '../../middlewares/rateLimiter.middleware.js'



const router = express.Router()


router.post('/login', rateLimiter(50, 900, 'login'), login)
router.post('/register', rateLimiter(30, 3600, 'register'), register)
router.post('/verify-otp', rateLimiter(50, 600, 'verify-otp'), verifyOTP)
router.post('/refresh-token', refreshToken)
router.post('/logout', logout)
router.post('/resend-otp', rateLimiter(30, 600, 'resend-otp'), resendOTP)

export default router; 
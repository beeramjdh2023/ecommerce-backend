import express from 'express'
import { register, verifyOTP, login, refreshToken, logout } from './auth.controller.js'
import { rateLimiter } from '../../middlewares/rateLimiter.middleware.js'



const router = express.Router()


router.post('/login', rateLimiter(5, 900, 'login'), login)
router.post('/register', rateLimiter(3, 3600, 'register'), register)
router.post('/verify-otp', rateLimiter(5, 600, 'verify-otp'), verifyOTP)
router.post('/refresh-token', refreshToken)
router.post('/logout', logout)


export default router; 
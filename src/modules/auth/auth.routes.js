import express from 'express'
import { register, verifyOTP, login, refreshToken, logout } from './auth.controller.js'




const router = express.Router()



router.post('/register', register)
router.post('/verify-otp', verifyOTP)
router.post('/login', login)
router.post('/refresh-token', refreshToken)
router.post('/logout', logout)


export default router; 
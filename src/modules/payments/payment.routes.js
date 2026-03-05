import express from 'express'
import { createPaymentOrderController, verifyPaymentController, webhookController } from './payment.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'

const router = express.Router()


router.post('/webhook',
  express.raw({ type: 'application/json' }),
  webhookController
)

router.post('/create-order', authenticate, createPaymentOrderController)
router.post('/verify', authenticate, verifyPaymentController)

export default router
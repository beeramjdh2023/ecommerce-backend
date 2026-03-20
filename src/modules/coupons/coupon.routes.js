import express from 'express'
import {
  createCouponController, validateCouponController,
  getAllCouponsController, deactivateCouponController
} from './coupon.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/role.middleware.js'

const router = express.Router()

// customer validate coupon before checkout
router.post('/validate', authenticate, validateCouponController)

// admin only
router.post('/', authenticate, authorize('ADMIN'), createCouponController)
router.get('/', authenticate, authorize('ADMIN'), getAllCouponsController)
router.delete('/:id', authenticate, authorize('ADMIN'), deactivateCouponController)

export default router
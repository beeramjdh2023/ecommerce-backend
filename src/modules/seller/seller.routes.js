import express from 'express'
import {
  createSellerProfileController, getMySellerProfileController,
  updateSellerProfileController, getSellerDashboardController,
  updateSellerStatusController, getAllSellersController
} from './seller.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/role.middleware.js'

const router = express.Router()

// seller routes
router.post('/profile', authenticate, createSellerProfileController)
router.get('/profile', authenticate, authorize('SELLER', 'ADMIN'), getMySellerProfileController)
router.put('/profile', authenticate, authorize('SELLER', 'ADMIN'), updateSellerProfileController)
router.get('/dashboard', authenticate, authorize('SELLER', 'ADMIN'), getSellerDashboardController)

// admin only routes
router.get('/', authenticate, authorize('ADMIN'), getAllSellersController)
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateSellerStatusController)

export default router
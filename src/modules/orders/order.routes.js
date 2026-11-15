import express from 'express'
import {
  placeOrderController, getOrderController,
  getUserOrdersController, updateOrderStatusController
} from './order.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/role.middleware.js'
import { getSellerOrdersController } from './order.controller.js'
import { getAllOrdersAdminController } from './order.controller.js'

const router = express.Router()

router.use(authenticate)

router.post('/', placeOrderController)
router.get('/', getUserOrdersController)

// IMPORTANT: specific routes MUST come before /:id to avoid being swallowed
router.get('/all', authorize('ADMIN'), getAllOrdersAdminController)
router.get('/seller/my-orders', authorize('SELLER', 'ADMIN'), getSellerOrdersController)

router.get('/:id', getOrderController)
router.patch('/:id/status', authorize('ADMIN', 'SELLER', 'CUSTOMER'), updateOrderStatusController)



export default router

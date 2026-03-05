import express from 'express'
import {
  placeOrderController, getOrderController,
  getUserOrdersController, updateOrderStatusController
} from './order.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/role.middleware.js'

const router = express.Router()

router.use(authenticate)

router.post('/', placeOrderController)
router.get('/', getUserOrdersController)
router.get('/:id', getOrderController)
router.patch('/:id/status', authorize('ADMIN', 'SELLER', 'CUSTOMER'), updateOrderStatusController)

export default router
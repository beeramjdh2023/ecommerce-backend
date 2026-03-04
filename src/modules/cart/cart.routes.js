import express from 'express'
import {
  getCartController, addToCartController, updateCartItemController,
  removeFromCartController, clearCartController
} from './cart.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'

const router = express.Router()

// all cart routes require login
router.use(authenticate)

router.get('/', getCartController)
router.post('/', addToCartController)
router.patch('/:productId', updateCartItemController)
router.delete('/clear', clearCartController)
router.delete('/:productId', removeFromCartController)

export default router
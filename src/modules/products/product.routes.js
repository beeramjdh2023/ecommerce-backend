import express from 'express'
import {
  createProductController, getProductsController, getProductController,
  updateProductController, deleteProductController
} from './product.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/role.middleware.js'

const router = express.Router()

// public routes
router.get('/', getProductsController)
router.get('/:id', getProductController)

// seller or admin only
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), createProductController)
router.put('/:id', authenticate, authorize('SELLER', 'ADMIN'), updateProductController)
router.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), deleteProductController)

export default router

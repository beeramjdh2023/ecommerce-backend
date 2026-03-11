import express from 'express'
import {
  createProductController, getProductsController, getProductController,
  updateProductController, deleteProductController
} from './product.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/role.middleware.js'
import { cacheMiddleware } from '../../middlewares/cache.middleware.js'

const router = express.Router()

// public routes — with caching
router.get('/', cacheMiddleware(60), getProductsController)        // cache 60 seconds
router.get('/:id', cacheMiddleware(120), getProductController)     // cache 2 minutes

// protected routes — no caching
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), createProductController)
router.put('/:id', authenticate, authorize('SELLER', 'ADMIN'), updateProductController)
router.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), deleteProductController)

export default router
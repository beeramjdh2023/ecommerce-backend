import express from 'express'
import {
  createProductController, getProductsController, getProductController,
  updateProductController, deleteProductController, getProductsBySellerController
} from './product.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/role.middleware.js'
import { cacheMiddleware } from '../../middlewares/cache.middleware.js'
import { upload } from '../../config/cloudinary.js'
import { uploadProductImageController } from './product.controller.js'

const router = express.Router()

// public routes — with caching
router.get('/', cacheMiddleware(60), getProductsController)        // cache 60 seconds

// IMPORTANT: specific routes MUST come before /:id to avoid being swallowed
router.get('/seller/:sellerId', getProductsBySellerController)

router.get('/:id', cacheMiddleware(120), getProductController)     // cache 2 minutes

// protected routes — no caching
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), createProductController)
router.put('/:id', authenticate, authorize('SELLER', 'ADMIN'), updateProductController)
router.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), deleteProductController)
router.post('/:id/images',authenticate,authorize('SELLER', 'ADMIN'),upload.single('image'),uploadProductImageController)


export default router

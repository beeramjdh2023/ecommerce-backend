import express from 'express'
import {
  createCategoryController, getAllCategoriesController, getCategoryController,
  updateCategoryController, deleteCategoryController
} from './category.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/role.middleware.js'
import { cacheMiddleware } from '../../middlewares/cache.middleware.js'

const router = express.Router()

// categories change rarely — cache longer
// public routes
router.get('/', cacheMiddleware(300), getAllCategoriesController)    // 5 minutes
router.get('/:id', cacheMiddleware(300), getCategoryController)     // 5 minutes


// admin only routes
router.post('/', authenticate, authorize('ADMIN'), createCategoryController)
router.put('/:id', authenticate, authorize('ADMIN'), updateCategoryController)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategoryController)

export default router
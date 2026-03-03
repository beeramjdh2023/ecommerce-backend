import express from 'express'
import {
  createCategoryController, getAllCategoriesController, getCategoryController,
  updateCategoryController, deleteCategoryController
} from './category.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/role.middleware.js'

const router = express.Router()

// public routes
router.get('/', getAllCategoriesController)
router.get('/:id', getCategoryController)

// admin only routes
router.post('/', authenticate, authorize('ADMIN'), createCategoryController)
router.put('/:id', authenticate, authorize('ADMIN'), updateCategoryController)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategoryController)

export default router
import express from 'express'
import { createReviewController, getProductReviewsController, deleteReviewController } from './review.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'

const router = express.Router()

// public — anyone can read reviews
router.get('/products/:productId/reviews', getProductReviewsController)

// protected — must be logged in
router.post('/', authenticate, createReviewController)
router.delete('/:id', authenticate, deleteReviewController)

export default router

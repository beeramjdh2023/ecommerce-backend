import express from 'express'
import { getWishlistController, addToWishlistController, removeFromWishlistController } from './wishlist.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.use(authenticate)

router.get('/', getWishlistController)
router.post('/', addToWishlistController)
router.delete('/:productId', removeFromWishlistController)

export default router
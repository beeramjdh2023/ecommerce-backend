import { createReviewService, getProductReviewsService, deleteReviewService } from './review.service.js'

export const createReviewController = async (req, res) => {
  try {
    const { product_id, order_id, rating, comment } = req.body
    if (!product_id || !order_id || !rating) {
      return res.status(400).json({ message: 'product_id, order_id and rating are required' })
    }
    const review = await createReviewService(req.user.id, { product_id, order_id, rating, comment })
    res.status(201).json({ message: 'Review created', review })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const getProductReviewsController = async (req, res) => {
  try {
    const result = await getProductReviewsService(req.params.productId, req.query)
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteReviewController = async (req, res) => {
  try {
    const { product_id } = req.body
    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' })
    }
    const result = await deleteReviewService(req.params.id, req.user.id, product_id)
    res.status(200).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
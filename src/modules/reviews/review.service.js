import {
  createReview, getReviewByUserAndProduct, getProductReviews,
  getProductReviewsCount, updateProductRating,
  checkUserOrderedProduct, deleteReview
} from './review.repository.js'

export const createReviewService = async (user_id, { product_id, order_id, rating, comment }) => {

  // 1. check user actually ordered and received this product
  const ordered = await checkUserOrderedProduct(user_id, product_id)
  if (!ordered) {
    throw new Error('You can only review products you have purchased and received')
  }

  // 2. check user hasn't already reviewed this product
  const existingReview = await getReviewByUserAndProduct(user_id, product_id)
  if (existingReview) {
    throw new Error('You have already reviewed this product')
  }

  // 3. validate rating
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // 4. create review
  const review = await createReview({ user_id, product_id, order_id, rating, comment })

  // 5. update product average rating
  await updateProductRating(product_id)

  return review
}

export const getProductReviewsService = async (product_id, query) => {
  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 10

  const [reviews, total] = await Promise.all([
    getProductReviews(product_id, page, limit),
    getProductReviewsCount(product_id)
  ])

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      has_next: page < Math.ceil(total / limit),
      has_prev: page > 1
    }
  }
}

export const deleteReviewService = async (id, user_id, product_id) => {
  await deleteReview(id, user_id)

  // recalculate rating after deletion
  await updateProductRating(product_id)

  return { message: 'Review deleted successfully' }
}
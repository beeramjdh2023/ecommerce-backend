import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const createReview = async ({ user_id, product_id, order_id, rating, comment }) => {
  const id = uuidv4()
  await pool.execute(
    `INSERT INTO reviews (id, user_id, product_id, order_id, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, user_id, product_id, order_id, rating, comment || null]
  )
  const [rows] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [id])
  return rows[0]
}

export const getReviewByUserAndProduct = async (user_id, product_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?',
    [user_id, product_id]
  )
  return rows[0] || null
}

export const getProductReviews = async (product_id, page, limit) => {
  const limitInt = parseInt(limit)
  const offsetInt = (parseInt(page) - 1) * limitInt

  const [rows] = await pool.execute(
    `SELECT 
      r.id, r.rating, r.comment, r.created_at,
      u.name AS reviewer_name,
      u.avatar_url AS reviewer_avatar
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC
     LIMIT ${limitInt} OFFSET ${offsetInt}`,
    [product_id]
  )
  return rows
}

export const getProductReviewsCount = async (product_id) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM reviews WHERE product_id = ?',
    [product_id]
  )
  return rows[0].total
}

export const updateProductRating = async (product_id) => {
  // recalculate average rating from all reviews
  await pool.execute(
    `UPDATE products 
     SET 
       average_rating = (
         SELECT AVG(rating) FROM reviews WHERE product_id = ?
       ),
       total_reviews = (
         SELECT COUNT(*) FROM reviews WHERE product_id = ?
       )
     WHERE id = ?`,
    [product_id, product_id, product_id]
  )
}

export const checkUserOrderedProduct = async (user_id, product_id) => {
  // check if user has a DELIVERED order containing this product
  const [rows] = await pool.execute(
    `SELECT oi.id FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE o.user_id = ?
     AND oi.product_id = ?
     AND o.status = 'DELIVERED'
     LIMIT 1`,
    [user_id, product_id]
  )
  return rows[0] || null
}

export const deleteReview = async (id, user_id) => {
  await pool.execute(
    'DELETE FROM reviews WHERE id = ? AND user_id = ?',
    [id, user_id]
  )
}
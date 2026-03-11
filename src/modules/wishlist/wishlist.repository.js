import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const getOrCreateWishlist = async (user_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM wishlists WHERE user_id = ?', [user_id]
  )
  if (rows[0]) return rows[0]

  const id = uuidv4()
  await pool.execute(
    'INSERT INTO wishlists (id, user_id) VALUES (?, ?)', [id, user_id]
  )
  return { id, user_id }
}

export const getWishlistWithItems = async (user_id) => {
  const [wishlist] = await pool.execute(
    'SELECT * FROM wishlists WHERE user_id = ?', [user_id]
  )
  if (!wishlist[0]) return null

  const [items] = await pool.execute(
    `SELECT 
      wi.id, wi.created_at,
      p.id AS product_id,
      p.name, p.slug, p.price,
      p.compare_price, p.average_rating,
      p.stock_quantity, p.is_active
     FROM wishlist_items wi
     JOIN products p ON wi.product_id = p.id
     WHERE wi.wishlist_id = ?
     ORDER BY wi.created_at DESC`,
    [wishlist[0].id]
  )
  return { ...wishlist[0], items }
}

export const getWishlistItem = async (wishlist_id, product_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
    [wishlist_id, product_id]
  )
  return rows[0] || null
}

export const addWishlistItem = async (wishlist_id, product_id) => {
  const id = uuidv4()
  await pool.execute(
    'INSERT INTO wishlist_items (id, wishlist_id, product_id) VALUES (?, ?, ?)',
    [id, wishlist_id, product_id]
  )
}

export const removeWishlistItem = async (wishlist_id, product_id) => {
  await pool.execute(
    'DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
    [wishlist_id, product_id]
  )
}
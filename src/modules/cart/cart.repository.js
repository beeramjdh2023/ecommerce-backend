import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const getOrCreateCart = async (user_id) => {
  // get existing cart
  const [rows] = await pool.execute(
    'SELECT * FROM carts WHERE user_id = ?',
    [user_id]
  )

  if (rows[0]) return rows[0]

  // create new cart if not exists
  const id = uuidv4()
  await pool.execute(
    'INSERT INTO carts (id, user_id) VALUES (?, ?)',
    [id, user_id]
  )
  return { id, user_id }
}

export const getCartWithItems = async (user_id) => {
  const [cartRows] = await pool.execute(
    'SELECT * FROM carts WHERE user_id = ?',
    [user_id]
  )

  if (!cartRows[0]) return null

  const cart_id = cartRows[0].id

  const [items] = await pool.execute(
    `SELECT 
      ci.id, ci.quantity, ci.cart_id,
      p.id AS product_id,
      p.name, p.slug, p.price,
      p.compare_price, p.stock_quantity,
      p.is_active,
      s.shop_name AS seller_name
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     JOIN seller_profiles s ON p.seller_id = s.id
     WHERE ci.cart_id = ?`,
    [cart_id]
  )

  return { ...cartRows[0], items }
}

export const getCartItem = async (cart_id, product_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cart_id, product_id]
  )
  return rows[0] || null
}

export const addCartItem = async ({ cart_id, product_id, quantity }) => {
  const id = uuidv4()
  await pool.execute(
    'INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)',
    [id, cart_id, product_id, quantity]
  )
}

export const updateCartItemQuantity = async (cart_id, product_id, quantity) => {
  await pool.execute(
    'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE cart_id = ? AND product_id = ?',
    [quantity, cart_id, product_id]
  )
}

export const removeCartItem = async (cart_id, product_id) => {
  await pool.execute(
    'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cart_id, product_id]
  )
}

export const clearCart = async (cart_id) => {
  await pool.execute(
    'DELETE FROM cart_items WHERE cart_id = ?',
    [cart_id]
  )
}
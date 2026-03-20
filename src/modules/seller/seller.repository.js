import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const createSellerProfile = async ({ user_id, shop_name, shop_description, gstin }) => {
  const id = uuidv4()
  await pool.execute(
    `INSERT INTO seller_profiles (id, user_id, shop_name, shop_description, gstin)
     VALUES (?, ?, ?, ?, ?)`,
    [id, user_id, shop_name, shop_description || null, gstin || null]
  )
  const [rows] = await pool.execute('SELECT * FROM seller_profiles WHERE id = ?', [id])
  return rows[0]
}

export const getSellerProfileByUserId = async (user_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM seller_profiles WHERE user_id = ?',
    [user_id]
  )
  return rows[0] || null
}

export const getSellerProfileById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT 
      sp.*,
      u.name AS owner_name,
      u.email AS owner_email
     FROM seller_profiles sp
     JOIN users u ON sp.user_id = u.id
     WHERE sp.id = ?`,
    [id]
  )
  return rows[0] || null
}

export const updateSellerProfile = async (user_id, { shop_name, shop_description, gstin }) => {
  await pool.execute(
    `UPDATE seller_profiles
     SET shop_name = ?, shop_description = ?, gstin = ?, updated_at = NOW()
     WHERE user_id = ?`,
    [shop_name, shop_description || null, gstin || null, user_id]
  )
  const [rows] = await pool.execute(
    'SELECT * FROM seller_profiles WHERE user_id = ?',
    [user_id]
  )
  return rows[0]
}

export const updateSellerStatus = async (id, status) => {
  await pool.execute(
    'UPDATE seller_profiles SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, id]
  )
  const [rows] = await pool.execute('SELECT * FROM seller_profiles WHERE id = ?', [id])
  return rows[0]
}

export const getAllSellers = async () => {
  const [rows] = await pool.execute(
    `SELECT 
      sp.*,
      u.name AS owner_name,
      u.email AS owner_email
     FROM seller_profiles sp
     JOIN users u ON sp.user_id = u.id
     ORDER BY sp.created_at DESC`
  )
  return rows
}

export const getSellerDashboard = async (seller_id) => {
  // total sales amount
  const [salesRows] = await pool.execute(
    `SELECT 
      COUNT(DISTINCT o.id) AS total_orders,
      COALESCE(SUM(oi.total_price), 0) AS total_revenue,
      COALESCE(SUM(oi.quantity), 0) AS total_items_sold
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE oi.seller_id = ?
     AND o.payment_status = 'PAID'`,
    [seller_id]
  )

  // total products
  const [productRows] = await pool.execute(
    `SELECT 
      COUNT(*) AS total_products,
      SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) AS out_of_stock,
      SUM(CASE WHEN stock_quantity < 10 THEN 1 ELSE 0 END) AS low_stock
     FROM products
     WHERE seller_id = ? AND is_active = 1`,
    [seller_id]
  )

  // recent orders
  const [recentOrders] = await pool.execute(
    `SELECT 
      o.id, o.status, o.created_at,
      oi.quantity, oi.total_price,
      p.name AS product_name
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN products p ON oi.product_id = p.id
     WHERE oi.seller_id = ?
     ORDER BY o.created_at DESC
     LIMIT 5`,
    [seller_id]
  )

  // top selling products
  const [topProducts] = await pool.execute(
    `SELECT 
      p.id, p.name, p.price,
      SUM(oi.quantity) AS total_sold,
      SUM(oi.total_price) AS total_revenue
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.seller_id = ?
     GROUP BY p.id
     ORDER BY total_sold DESC
     LIMIT 5`,
    [seller_id]
  )

  return {
    stats: {
      ...salesRows[0],
      ...productRows[0]
    },
    recent_orders: recentOrders,
    top_products: topProducts
  }
}
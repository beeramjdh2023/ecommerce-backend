import pool from '../../config/db.js'

export const getPlatformStats = async () => {
  const [userStats] = await pool.execute(
    `SELECT
      COUNT(*) AS total_users,
      SUM(CASE WHEN role = 'CUSTOMER' THEN 1 ELSE 0 END) AS total_customers,
      SUM(CASE WHEN role = 'SELLER' THEN 1 ELSE 0 END) AS total_sellers,
      SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS suspended_users
     FROM users`
  )

  const [orderStats] = await pool.execute(
    `SELECT
      COUNT(*) AS total_orders,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_orders,
      SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered_orders,
      SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_orders,
      COALESCE(SUM(final_amount), 0) AS total_revenue
     FROM orders
     WHERE payment_status = 'PAID'`
  )

  const [productStats] = await pool.execute(
    `SELECT
      COUNT(*) AS total_products,
      SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) AS out_of_stock,
      SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive_products
     FROM products`
  )

  const [sellerStats] = await pool.execute(
    `SELECT
      COUNT(*) AS total_sellers,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_approval,
      SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_sellers,
      SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END) AS suspended_sellers
     FROM seller_profiles`
  )

  return {
    users: userStats[0],
    orders: orderStats[0],
    products: productStats[0],
    sellers: sellerStats[0]
  }
}

export const getAllUsers = async () => {
  const [rows] = await pool.execute(
    `SELECT
      id, name, email, role, is_active, created_at
     FROM users
     ORDER BY created_at DESC`
  )
  return rows
}

export const getUserById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  )
  return rows[0] || null
}

export const updateUserStatus = async (id, is_active) => {
  await pool.execute(
    'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
    [is_active, id]
  )
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, is_active FROM users WHERE id = ?',
    [id]
  )
  return rows[0]
}

export const getSalesReport = async (from_date, to_date) => {
  const [rows] = await pool.execute(
    `SELECT
      DATE(o.created_at) AS date,
      COUNT(DISTINCT o.id) AS total_orders,
      COALESCE(SUM(o.final_amount), 0) AS revenue,
      COUNT(DISTINCT o.user_id) AS unique_customers
     FROM orders o
     WHERE o.payment_status = 'PAID'
     AND DATE(o.created_at) BETWEEN ? AND ?
     GROUP BY DATE(o.created_at)
     ORDER BY date ASC`,
    [from_date, to_date]
  )

  const [summary] = await pool.execute(
    `SELECT
      COUNT(DISTINCT o.id) AS total_orders,
      COALESCE(SUM(o.final_amount), 0) AS total_revenue,
      COUNT(DISTINCT o.user_id) AS unique_customers,
      COALESCE(AVG(o.final_amount), 0) AS average_order_value
     FROM orders o
     WHERE o.payment_status = 'PAID'
     AND DATE(o.created_at) BETWEEN ? AND ?`,
    [from_date, to_date]
  )

  return {
    summary: summary[0],
    daily_breakdown: rows
  }
}

export const getTopProducts = async () => {
  const [rows] = await pool.execute(
    `SELECT
      p.id, p.name, p.price,
      c.name AS category,
      s.shop_name AS seller,
      SUM(oi.quantity) AS total_sold,
      COALESCE(SUM(oi.total_price), 0) AS total_revenue
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     JOIN categories c ON p.category_id = c.id
     JOIN seller_profiles s ON p.seller_id = s.id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.payment_status = 'PAID'
     GROUP BY p.id
     ORDER BY total_sold DESC
     LIMIT 10`
  )
  return rows
}
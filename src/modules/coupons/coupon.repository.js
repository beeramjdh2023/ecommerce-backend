import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const createCoupon = async ({ code, type, value, min_order_amount, max_discount, usage_limit, expires_at }) => {
  const id = uuidv4()
  await pool.execute(
    `INSERT INTO coupons (id, code, type, value, min_order_amount, max_discount, usage_limit, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, code.toUpperCase(), type, value, min_order_amount || 0, max_discount || null, usage_limit || null, expires_at || null]
  )
  const [rows] = await pool.execute('SELECT * FROM coupons WHERE id = ?', [id])
  return rows[0]
}

export const getCouponByCode = async (code) => {
  const [rows] = await pool.execute(
    'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
    [code.toUpperCase()]
  )
  return rows[0] || null
}

export const getAllCoupons = async () => {
  const [rows] = await pool.execute(
    'SELECT * FROM coupons ORDER BY created_at DESC'
  )
  return rows
}

export const getCouponUsageByUser = async (coupon_id, user_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM coupon_usage WHERE coupon_id = ? AND user_id = ?',
    [coupon_id, user_id]
  )
  return rows[0] || null
}

export const recordCouponUsage = async ({ coupon_id, user_id, order_id }) => {
  const id = uuidv4()
  await pool.execute(
    'INSERT INTO coupon_usage (id, coupon_id, user_id, order_id) VALUES (?, ?, ?, ?)',
    [id, coupon_id, user_id, order_id]
  )

  // increment used count
  await pool.execute(
    'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
    [coupon_id]
  )
}

export const deactivateCoupon = async (id) => {
  await pool.execute(
    'UPDATE coupons SET is_active = FALSE WHERE id = ?',
    [id]
  )
}
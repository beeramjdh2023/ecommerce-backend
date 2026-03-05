import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const createPayment = async ({ order_id, razorpay_order_id, amount, idempotency_key }) => {
  const id = uuidv4()
  await pool.execute(
    `INSERT INTO payments (id, order_id, razorpay_order_id, amount, idempotency_key)
     VALUES (?, ?, ?, ?, ?)`,
    [id, order_id, razorpay_order_id, amount, idempotency_key]
  )
  const [rows] = await pool.execute('SELECT * FROM payments WHERE id = ?', [id])
  return rows[0]
}

export const getPaymentByOrderId = async (order_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM payments WHERE order_id = ?',
    [order_id]
  )
  return rows[0] || null
}

export const getPaymentByIdempotencyKey = async (idempotency_key) => {
  const [rows] = await pool.execute(
    'SELECT * FROM payments WHERE idempotency_key = ?',
    [idempotency_key]
  )
  return rows[0] || null
}

export const updatePaymentStatus = async ({ order_id, razorpay_payment_id, razorpay_signature, status, method }) => {
  await pool.execute(
    `UPDATE payments 
     SET razorpay_payment_id = ?, razorpay_signature = ?, 
         status = ?, method = ?, updated_at = NOW()
     WHERE order_id = ?`,
    [razorpay_payment_id, razorpay_signature, status, method || null, order_id]
  )
}

export const updateOrderPaymentStatus = async (order_id, payment_status, razorpay_order_id) => {
  await pool.execute(
    `UPDATE orders 
     SET payment_status = ?, razorpay_order_id = ?, updated_at = NOW()
     WHERE id = ?`,
    [payment_status, razorpay_order_id, order_id]
  )
}
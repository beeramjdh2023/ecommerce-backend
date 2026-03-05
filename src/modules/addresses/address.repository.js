import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const createAddress = async ({ user_id, full_name, phone, street, city, state, pincode, country, is_default }) => {
  const id = uuidv4()

  // if this is default, unset all other defaults first
  if (is_default) {
    await pool.execute(
      'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
      [user_id]
    )
  }

  await pool.execute(
    `INSERT INTO addresses (id, user_id, full_name, phone, street, city, state, pincode, country, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, user_id, full_name, phone, street, city, state, pincode, country || 'India', is_default || false]
  )

  const [rows] = await pool.execute('SELECT * FROM addresses WHERE id = ?', [id])
  return rows[0]
}

export const getUserAddresses = async (user_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
    [user_id]
  )
  return rows
}

export const getAddressById = async (id, user_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
    [id, user_id]
  )
  return rows[0] || null
}

export const deleteAddress = async (id, user_id) => {
  await pool.execute(
    'DELETE FROM addresses WHERE id = ? AND user_id = ?',
    [id, user_id]
  )
}
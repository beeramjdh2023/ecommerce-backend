import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const createCategory = async ({ name, slug, image_url, parent_id }) => {
  const id = uuidv4()
  await pool.execute(
    `INSERT INTO categories (id, name, slug, image_url, parent_id)
     VALUES (?, ?, ?, ?, ?)`,
    [id, name, slug, image_url || null, parent_id || null]
  )
  const [rows] = await pool.execute(
    'SELECT * FROM categories WHERE id = ?', [id]
  )
  return rows[0]
}

export const getAllCategories = async () => {
  const [rows] = await pool.execute(
    `SELECT 
      c.id, c.name, c.slug, c.image_url, c.is_active,
      c.parent_id,
      p.name AS parent_name
     FROM categories c
     LEFT JOIN categories p ON c.parent_id = p.id
     WHERE c.is_active = 1
     ORDER BY c.parent_id IS NULL DESC, c.name ASC`
  )
  return rows
}

export const getCategoryById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT 
      c.*, p.name AS parent_name
     FROM categories c
     LEFT JOIN categories p ON c.parent_id = p.id
     WHERE c.id = ?`,
    [id]
  )
  return rows[0] || null
}

export const getCategoryBySlug = async (slug) => {
  const [rows] = await pool.execute(
    'SELECT * FROM categories WHERE slug = ?', [slug]
  )
  return rows[0] || null
}

export const updateCategory = async (id, { name, slug, image_url, parent_id }) => {
  await pool.execute(
    `UPDATE categories 
     SET name = ?, slug = ?, image_url = ?, parent_id = ?, updated_at = NOW()
     WHERE id = ?`,
    [name, slug, image_url || null, parent_id || null, id]
  )
  const [rows] = await pool.execute(
    'SELECT * FROM categories WHERE id = ?', [id]
  )
  return rows[0]
}

export const deleteCategory = async (id) => {
  // soft delete — just mark inactive
  await pool.execute(
    'UPDATE categories SET is_active = FALSE WHERE id = ?', [id]
  )
}

export const getSubcategories = async (parent_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM categories WHERE parent_id = ? AND is_active = 1', [parent_id]
  )
  return rows
}
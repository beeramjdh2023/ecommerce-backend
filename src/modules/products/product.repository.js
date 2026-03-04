import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const createProduct = async ({ seller_id, category_id, name, slug, description, price, compare_price, stock_quantity, sku }) => {
  const id = uuidv4()
  await pool.execute(
    `INSERT INTO products 
     (id, seller_id, category_id, name, slug, description, price, compare_price, stock_quantity, sku)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, seller_id, category_id, name, slug, description, price, compare_price || null, stock_quantity, sku || null]
  )
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id])
  return rows[0]
}

export const getProducts = async ({ category_id, min_price, max_price, search, sort, page, limit }) => {

  const limitInt = parseInt(limit)
  const pageInt = parseInt(page)
  const offsetInt = (pageInt - 1) * limitInt
  const minPrice = min_price ? parseFloat(min_price) : null
  const maxPrice = max_price ? parseFloat(max_price) : null

  if (isNaN(limitInt) || isNaN(offsetInt)) {
    throw new Error('Invalid pagination parameters')
  }

  const params = []

  let query = `
    SELECT 
      p.id, p.name, p.slug, p.price, p.compare_price,
      p.stock_quantity, p.average_rating, p.total_reviews,
      p.total_sold, p.is_featured, p.created_at,
      c.name AS category_name,
      s.shop_name AS seller_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN seller_profiles s ON p.seller_id = s.id
    WHERE p.is_active = 1
  `

  if (category_id) {
    query += ' AND p.category_id = ?'
    params.push(category_id)
  }

  if (minPrice) {
    query += ' AND p.price >= ?'
    params.push(minPrice)
  }

  if (maxPrice) {
    query += ' AND p.price <= ?'
    params.push(maxPrice)
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  const sortOptions = {
    newest: 'p.created_at DESC',
    oldest: 'p.created_at ASC',
    price_low: 'p.price ASC',
    price_high: 'p.price DESC',
    rating: 'p.average_rating DESC',
    popular: 'p.total_sold DESC'
  }

  query += ` ORDER BY ${sortOptions[sort] || sortOptions.newest}`
  query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`

  const [rows] = await pool.execute(query, params)
  return rows
}

export const getProductsCount = async ({ category_id, min_price, max_price, search }) => {
  const minPrice = min_price ? parseFloat(min_price) : null
  const maxPrice = max_price ? parseFloat(max_price) : null
  const params = []

  let query = 'SELECT COUNT(*) as total FROM products p WHERE p.is_active = 1'

  if (category_id) {
    query += ' AND p.category_id = ?'
    params.push(category_id)
  }
  if (minPrice) {
    query += ' AND p.price >= ?'
    params.push(minPrice)
  }
  if (maxPrice) {
    query += ' AND p.price <= ?'
    params.push(maxPrice)
  }
  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  const [rows] = await pool.execute(query, params)
  return rows[0].total
}

export const getProductById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT 
      p.*,
      c.name AS category_name,
      s.shop_name AS seller_name,
      s.rating AS seller_rating
     FROM products p
     JOIN categories c ON p.category_id = c.id
     JOIN seller_profiles s ON p.seller_id = s.id
     WHERE p.id = ? AND p.is_active = 1`,
    [id]
  )
  return rows[0] || null
}

export const getProductImages = async (product_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
    [product_id]
  )
  return rows
}

export const addProductImage = async ({ product_id, image_url, is_primary, display_order }) => {
  const id = uuidv4()
  await pool.execute(
    'INSERT INTO product_images (id, product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?, ?)',
    [id, product_id, image_url, is_primary, display_order]
  )
}

export const updateProduct = async (id, fields) => {
  await pool.execute(
    `UPDATE products 
     SET name=?, slug=?, description=?, price=?, compare_price=?, 
         stock_quantity=?, sku=?, category_id=?, updated_at=NOW()
     WHERE id=?`,
    [fields.name, fields.slug, fields.description, fields.price,
     fields.compare_price || null, fields.stock_quantity,
     fields.sku || null, fields.category_id, id]
  )
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id])
  return rows[0]
}

export const deleteProduct = async (id) => {
  await pool.execute(
    'UPDATE products SET is_active = FALSE WHERE id = ?', [id]
  )
}

export const getSellerProfile = async (user_id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM seller_profiles WHERE user_id = ?', [user_id]
  )
  return rows[0] || null
}
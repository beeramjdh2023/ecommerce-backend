import pool from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const placeOrder = async (user_id, address_id, cartItems, total_amount, discount_amount, final_amount, coupon_code) => {
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()
    // 1. lock and validate stock for each item
    for (const item of cartItems) {
      const [rows] = await conn.execute(
        'SELECT stock_quantity, is_active FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      )
    
      if (!rows[0] || !rows[0].is_active) {
        throw new Error(`Product ${item.name} is no longer available`)
      }
      if (rows[0].stock_quantity < item.quantity) {
        throw new Error(`Only ${rows[0].stock_quantity} units of ${item.name} available`)
      }
    }

    
    // 2. create order
    const order_id = uuidv4()
    await conn.execute(
      `INSERT INTO orders (id, user_id, address_id, total_amount, discount_amount, final_amount, coupon_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [order_id, user_id, address_id, total_amount, discount_amount, final_amount, coupon_code || null]
    )



    // 4. create order items + deduct stock
    for (const item of cartItems) {
      const order_item_id = uuidv4()
      // console.log(order_item_id, order_id, item.product_id, item.seller_id, item.quantity, item.price, item.price * item.quantity)
      console.log(item)
      await conn.execute(
        `INSERT INTO order_items (id, order_id, product_id, seller_id, quantity, price_at_purchase, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [order_item_id, order_id, item.product_id, item.seller_id, item.quantity, item.price, item.price * item.quantity]
      )
      // deduct stock
      await conn.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ?, total_sold = total_sold + ? WHERE id = ?',
        [item.quantity, item.quantity, item.product_id]
      )
    }

    // 5. record initial status in history
     const history_id = uuidv4()
    await conn.execute(
      'INSERT INTO order_status_history (id, order_id, status, note) VALUES (?, ?, ?, ?)',
      [history_id, order_id, 'PENDING', 'Order placed successfully']
    )

    // 6. clear cart
    await conn.execute(
      'DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = ?)',
      [user_id]
    )

    await conn.commit()
    return order_id

  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export const getOrderById = async (order_id) => {
  const [orders] = await pool.execute(
    `SELECT 
      o.*,
      a.full_name, a.phone, a.street, a.city, a.state, a.pincode
     FROM orders o
     JOIN addresses a ON o.address_id = a.id
     WHERE o.id = ?`,
    [order_id]
  )

  if (!orders[0]) return null

  const [items] = await pool.execute(
    `SELECT 
      oi.*,
      p.name AS product_name,
      p.slug AS product_slug,
      s.shop_name AS seller_name
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     JOIN seller_profiles s ON oi.seller_id = s.id
     WHERE oi.order_id = ?`,
    [order_id]
  )

  const [history] = await pool.execute(
    'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC',
    [order_id]
  )

  return { ...orders[0], items, history }
}

export const getUserOrders = async (user_id) => {
  const limitInt = 10
  const offsetInt = 0

  const [orders] = await pool.execute(
    `SELECT 
      o.id, o.status, o.final_amount, o.payment_status, o.created_at,
      COUNT(oi.id) AS total_items
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT ${limitInt} OFFSET ${offsetInt}`,
    [user_id]
  )
  return orders
}

export const updateOrderStatus = async (order_id, status, note) => {
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    await conn.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, order_id]
    )

    const history_id = uuidv4()
    await conn.execute(
      'INSERT INTO order_status_history (id, order_id, status, note) VALUES (?, ?, ?, ?)',
      [history_id, order_id, status, note || null]
    )

    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
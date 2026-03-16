import express from 'express'
import authroutes from './modules/auth/auth.routes.js'
import dotenv from 'dotenv'    
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js'
import categoryRoutes from './modules/categories/category.routes.js'
import productRoutes from './modules/products/product.routes.js'
import cartRoutes from './modules/cart/cart.routes.js'
import orderRoutes from './modules/orders/order.routes.js'
import addressRoutes from './modules/addresses/address.routes.js'
import paymentRoutes from './modules/payments/payment.routes.js'
import reviewRoutes from './modules/reviews/review.routes.js'
import wishlistRoutes from './modules/wishlist/wishlist.routes.js'
import { rateLimiter } from './middlewares/rateLimiter.middleware.js'

dotenv.config();

const app=express();

app.use(rateLimiter(100, 60, 'global'))

app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    next() // skip express.json() for webhook because webhook need raw body to verify signature
  } else {
    express.json()(req, res, next) // parse JSON for everything else so we get req.body in others
  }
})

app.use(cookieParser());

import pool from './config/db.js'

app.get('/api/v1/test/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name FROM products p 
       JOIN categories c ON p.category_id = c.id
       JOIN seller_profiles s ON p.seller_id = s.id
       WHERE p.is_active = 1
       LIMIT ? OFFSET ?`,
      [10, 0]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.use('/api/v1/auth', authroutes);
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/cart', cartRoutes)
app.use('/api/v1/addresses', addressRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/wishlist', wishlistRoutes)

app.get("/",(req,res)=>{
    res.status(200).json({message:"ecommerce api is running "});
})

app.use(errorHandler)

export default app;

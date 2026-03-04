import express from 'express'
import authroutes from './modules/auth/auth.routes.js'
import dotenv from 'dotenv'    
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js'
import categoryRoutes from './modules/categories/category.routes.js'
import productRoutes from './modules/products/product.routes.js'

dotenv.config();

const app=express();


app.use(express.json());
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


app.get("/",(req,res)=>{
    res.status(200).json({message:"ecommerce api is running "});
})

app.use(errorHandler)

export default app;

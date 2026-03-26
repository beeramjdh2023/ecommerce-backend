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
import sellerRoutes from './modules/seller/seller.routes.js'
import couponRoutes from './modules/coupons/coupon.routes.js'
import path from 'path'
import { fileURLToPath } from 'url'


dotenv.config();

const app=express();
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)



app.use(rateLimiter(100, 60, 'global'))

app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    next() // skip express.json() for webhook because webhook need raw body to verify signature
  } else {
    express.json()(req, res, next) // parse JSON for everything else so we get req.body in others
  }
})

app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')))


app.use('/api/v1/auth', authroutes);
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/cart', cartRoutes)
app.use('/api/v1/addresses', addressRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/wishlist', wishlistRoutes)
app.use('/api/v1/sellers', sellerRoutes)
app.use('/api/v1/coupons', couponRoutes)

app.get("/",(req,res)=>{
    res.status(200).json({message:"ecommerce api is running "});
})

app.use(errorHandler)

export default app;

import express from 'express'
import authroutes from './modules/auth/auth.routes.js'
import dotenv from 'dotenv'    
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js'

dotenv.config();

const app=express();


app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authroutes);


app.get("/",(req,res)=>{
    res.status(200).json({message:"ecommerce api is running "});
})

app.use(errorHandler)

export default app;

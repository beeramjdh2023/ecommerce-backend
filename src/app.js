import express from 'express'
import authroutes from './modules/auth/auth.routes.js'
import dotenv from 'dotenv'    


dotenv.config();

const app=express();


app.use(express.json());

app.use('/api/v1/auth', authroutes);


app.get("/",(req,res)=>{
    res.status(200).json({message:"ecommerce api is running "});
})

export default app;

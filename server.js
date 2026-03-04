import app from './src/app.js';
import dotenv from 'dotenv'

dotenv.config();

const port=process.env.PORT || 4000


app.listen(4000,()=>{
    console.log("ecommerse server is listing on ",port);
})
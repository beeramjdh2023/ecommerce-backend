import app from './src/app.js';
import './src/queues/order.consumer.js'
import dotenv from 'dotenv'

dotenv.config();

const port=process.env.PORT || 4000


app.listen(port,()=>{
    console.log("ecommerce server is listening on port",port);
})

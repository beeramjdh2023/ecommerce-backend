

import Redis from "ioredis";
import dotenv from 'dotenv'

dotenv.config();

const redis=new Redis({
    host: process.env.REDIS_HOST || localhost,
    port: process.env.REDIS_PORT || 6379
}
)


redis.on("connect",()=>{
    console.log("redis connected successfully");
})

redis.on("error",(err)=>{
    console.error("redis conection failed",err.message);
})


export default redis;
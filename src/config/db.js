import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config();

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    queueLimit:0,
    connectionLimit:10,
    password:process.env.DB_PASSWORD,
    waitForConnections:true,
    user:process.env.DB_USER
});

const testConnection=async()=>{
    try{
         const conn=await pool.getConnection();
         console.log("Connetion with database established successfully");
         conn.release();
    }catch(err){
        console.log("Mysql Connection failed",err.message);
        process.exit(1);
    }
}

testConnection();

export default pool;
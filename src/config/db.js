import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config();

// Support both individual vars and a single DATABASE_URL (for hosted MySQL like Aiven/TiDB)
const getPoolConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: true
      }
    }
  }
  return {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    queueLimit: 0,
    connectionLimit: 10,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    user: process.env.DB_USER,
    port: parseInt(process.env.DB_PORT) || 3306
  }
}

const pool = mysql.createPool(getPoolConfig());

const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("Connection with database established successfully");
    conn.release();
  } catch (err) {
    console.error("MySQL Connection failed:", err.message);
    // Don't exit in production — let the app start and retry connections
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

testConnection();

export default pool;

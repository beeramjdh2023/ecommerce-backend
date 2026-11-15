import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config();

// Support both individual DB_* vars (preferred) and a single DATABASE_URL
const getPoolConfig = () => {
  // Prefer individual vars — no URL-parsing issues with special chars in username/password
  if (process.env.DB_HOST) {
    const config = {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      queueLimit: 0,
      connectionLimit: 10,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      user: process.env.DB_USER,
      port: parseInt(process.env.DB_PORT) || 3306
    }

    // Enable SSL/TLS for hosted MySQL (TiDB, PlanetScale, etc.)
    if (process.env.DB_SSL === 'true') {
      config.ssl = {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    }

    return config
  }

  // Fallback: parse DATABASE_URL
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL)
    return {
      host: url.hostname,
      port: parseInt(url.port) || 4000,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace('/', ''),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    }
  }

  // Local development defaults
  return {
    host: 'localhost',
    database: 'ecommerce_db',
    queueLimit: 0,
    connectionLimit: 10,
    password: 'Password',
    waitForConnections: true,
    user: 'root',
    port: 3306
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

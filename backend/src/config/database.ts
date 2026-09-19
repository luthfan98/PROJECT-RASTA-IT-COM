import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', env.DB_NAME);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error);
    return false;
  }
}

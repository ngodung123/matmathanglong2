import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'Dung123@',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'mat_ma_thang_long',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  ssl: process.env.MYSQL_HOST?.includes('aivencloud.com')
    ? { rejectUnauthorized: false }
    : undefined,
})
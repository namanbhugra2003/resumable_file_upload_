import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'bhugrapaaji',
  database: process.env.DB_NAME || 'resumable_upload'
})

export default pool

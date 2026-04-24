'use strict';

const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_NAME || 'TAG_QLSX',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true,
  },
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 30000,
  requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT, 10) || 30000,
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

/**
 * Kết nối database và khởi tạo connection pool
 */
async function connectDB() {
  if (pool) return pool;
  pool = await sql.connect(config);
  console.log(`🗄️  Đã kết nối SQL Server: ${config.server}/${config.database}`);
  return pool;
}

/**
 * Lấy pool hiện tại (dùng trong các repository)
 */
function getPool() {
  if (!pool) throw new Error('Database chưa được kết nối. Gọi connectDB() trước.');
  return pool;
}

module.exports = { sql, connectDB, getPool };

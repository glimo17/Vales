const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const rawServer = process.env.DB_SERVER || 'localhost';
const serverParts = rawServer.split('\\');
const parsedServer = serverParts[0] || 'localhost';
const parsedInstance = serverParts[1] || undefined;

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: parsedServer,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === 'true',
    trustServerCertificate: String(process.env.DB_TRUST_SERVER_CERT).toLowerCase() === 'true',
    instanceName: process.env.DB_INSTANCE || parsedInstance,
  },
};

let pool;

async function getPool() {
  if (pool) {
    return pool;
  }

  pool = await sql.connect(config);
  return pool;
}

module.exports = {
  sql,
  getPool,
};

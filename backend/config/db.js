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
let schemaEnsured = false;

async function ensureSchema(activePool) {
  if (schemaEnsured) {
    return;
  }

  await activePool.request().query(`
    IF OBJECT_ID('pagos_prestamo', 'U') IS NULL
    BEGIN
      CREATE TABLE pagos_prestamo (
        id INT IDENTITY(1,1) PRIMARY KEY,
        prestamo_id INT NOT NULL,
        monto DECIMAL(18,2) NOT NULL,
        observacion NVARCHAR(255) NULL,
        fecha_pago DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_pagos_prestamo_prestamo
          FOREIGN KEY (prestamo_id) REFERENCES prestamos(id)
      );
    END
  `);

  schemaEnsured = true;
}

async function getPool() {
  if (pool) {
    return pool;
  }

  pool = await sql.connect(config);
  await ensureSchema(pool);
  return pool;
}

module.exports = {
  sql,
  getPool,
};

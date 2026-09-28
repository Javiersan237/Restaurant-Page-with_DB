// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Pool de conexiones a SQL Server.
// =====================================================================

const sql = require('mssql');
const { DB } = require('./env');

let pool = null;

async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    pool = await sql.connect(DB);
    console.log(`OK: Conectado a SQL Server -> ${DB.server}:${DB.port}/${DB.database}`);
    return pool;
  } catch (err) {
    console.error('ERROR: No se pudo conectar a SQL Server');
    console.error(`  Servidor : ${DB.server}:${DB.port}`);
    console.error(`  Base     : ${DB.database}`);
    console.error(`  Mensaje  : ${err.message}`);
    throw err;
  }
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('OK: Conexion a SQL Server cerrada.');
  }
}

module.exports = {
  getPool,
  closePool,
  sql,
};
// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Pool de conexiones a SQL Server (versión robusta).
// =====================================================================

const sql = require('mssql');
const { DB } = require('./env');

let pool = null;

// Configuración mejorada del pool
const POOL_CONFIG = {
  ...DB,
  pool: {
    min: 0,                      // no mantener conexiones abiertas al inicio
    max: 10,                     // máximo 10 conexiones simultáneas
    idleTimeoutMillis: 30000,    // cerrar conexiones inactivas después de 30s
  },
  options: {
    ...(DB.options || {}),
    enableArithAbort: true,
    trustServerCertificate: true,
    encrypt: false,
  },
  connectionTimeout: 15000,      // 15s para conectar
  requestTimeout: 30000,         // 30s para una query
};

// ==========================================
// getPool: devuelve un pool SIEMPRE funcional
// ==========================================
async function getPool() {
  // Si el pool existe y no está marcado como roto, usarlo
  if (pool && pool.connected && !pool.__broken) {
    return pool;
  }

  // Si el pool existe pero está roto, cerrarlo primero
  if (pool) {
    try {
      await pool.close();
    } catch (_) {
      // ignorar errores al cerrar un pool roto
    }
    pool = null;
  }

  try {
    pool = await sql.connect(POOL_CONFIG);

    // Marcar el pool como roto si la conexión se cae
    pool.__broken = false;

    pool.on('error', (err) => {
      console.error('[DB] Error en el pool:', err.message);
      pool.__broken = true;
    });

    console.log(
      `OK: Conectado a SQL Server -> ${DB.server}:${DB.port}/${DB.database}`
    );
    return pool;
  } catch (err) {
    console.error('ERROR: No se pudo conectar a SQL Server');
    console.error(`  Servidor : ${DB.server}:${DB.port}`);
    console.error(`  Base     : ${DB.database}`);
    console.error(`  Mensaje  : ${err.message}`);
    pool = null;
    throw err;
  }
}

// ==========================================
// closePool: cierra el pool al apagar el server
// ==========================================
async function closePool() {
  if (pool) {
    try {
      await pool.close();
      console.log('OK: Conexion a SQL Server cerrada.');
    } catch (err) {
      console.error('ERROR al cerrar el pool:', err.message);
    } finally {
      pool = null;
    }
  }
}

// ==========================================
// withRetry: ejecuta una función con el pool,
// reintentando una vez si falla por conexión.
// ==========================================
async function withRetry(fn) {
  try {
    const p = await getPool();
    return await fn(p);
  } catch (err) {
    // Si el error es de conexión, forzar reconexión y reintentar
    const errMsg = String(err.message || '');
    const esErrorDeConexion =
      errMsg.includes('ECONNRESET') ||
      errMsg.includes('Connection lost') ||
      errMsg.includes('Connection is closed') ||
      errMsg.includes('socket hang up') ||
      errMsg.includes('ESOCKET');

    if (esErrorDeConexion) {
      console.warn('[DB] Reintentando por error de conexión...');
      if (pool) {
        try { await pool.close(); } catch (_) {}
        pool = null;
      }
      const p = await getPool();
      return await fn(p);
    }
    throw err;
  }
}

module.exports = {
  getPool,
  closePool,
  withRetry,
  sql,
};
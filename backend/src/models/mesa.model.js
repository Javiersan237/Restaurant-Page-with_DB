// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Modelo de Mesas: acceso a datos en SQL Server.
// =====================================================================

const { getPool, sql } = require('../config/database');

/**
 * Lista todas las mesas con filtros opcionales.
 * @param {Object} filtros - { ubicacion, capacidadMinima, estado }
 * @returns {Promise<Array>} Lista de mesas
 */
async function findAll(filtros = {}) {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT 
      MesaID       AS mesaID,
      NumeroMesa   AS numeroMesa,
      Capacidad    AS capacidad,
      Ubicacion    AS ubicacion,
      Estado       AS estado
    FROM dbo.Mesas
    WHERE 1 = 1
  `;

  if (filtros.ubicacion) {
    request.input('Ubicacion', sql.NVarChar(50), filtros.ubicacion);
    query += ' AND Ubicacion = @Ubicacion';
  }

  if (filtros.capacidadMinima) {
    request.input('CapacidadMinima', sql.Int, filtros.capacidadMinima);
    query += ' AND Capacidad >= @CapacidadMinima';
  }

  if (filtros.estado) {
    request.input('Estado', sql.NVarChar(20), filtros.estado);
    query += ' AND Estado = @Estado';
  }

  query += `
    ORDER BY 
      CASE Ubicacion
        WHEN 'Terraza' THEN 1
        WHEN 'Salon Principal' THEN 2
        WHEN 'Salon Privado' THEN 3
        WHEN 'Bar' THEN 4
        ELSE 5
      END,
      NumeroMesa
  `;

  const result = await request.query(query);
  return result.recordset;
}

/**
 * Busca una mesa por su ID.
 * @param {number} mesaID
 * @returns {Promise<Object|null>}
 */
async function findById(mesaID) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MesaID', sql.Int, mesaID)
    .query(`
      SELECT 
        MesaID       AS mesaID,
        NumeroMesa   AS numeroMesa,
        Capacidad    AS capacidad,
        Ubicacion    AS ubicacion,
        Estado       AS estado
      FROM dbo.Mesas
      WHERE MesaID = @MesaID
    `);

  return result.recordset[0] || null;
}

module.exports = {
  findAll,
  findById,
};
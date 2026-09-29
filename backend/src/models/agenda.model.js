// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Modelo de Agendas: acceso a datos en SQL Server.
// =====================================================================

const { getPool, sql } = require('../config/database');

/**
 * Busca una agenda por su bloque exacto (fecha + horaInicio + horaFin).
 * @param {Object} params - { fecha, horaInicio, horaFin, transaction }
 * @returns {Promise<Object|null>}
 */
async function findByBloque({ fecha, horaInicio, horaFin, transaction }) {
  const pool = await getPool();
  const request = transaction ? transaction.request() : pool.request();

  const result = await request
    .input('Fecha', sql.Date, fecha)
    .input('HoraInicio', sql.VarChar(8), horaInicio)
    .input('HoraFin', sql.VarChar(8), horaFin)
    .query(`
      SELECT 
        AgendaID       AS agendaID,
        Fecha          AS fecha,
        HoraInicio     AS horaInicio,
        HoraFin        AS horaFin,
        DuracionMin    AS duracionMin,
        Estado         AS estado,
        FechaCreacion  AS fechaCreacion
      FROM dbo.Agendas
      WHERE Fecha = @Fecha
        AND HoraInicio = @HoraInicio
        AND HoraFin = @HoraFin
    `);

  return result.recordset[0] || null;
}

/**
 * Crea una nueva agenda.
 * @param {Object} params - { fecha, horaInicio, horaFin, duracionMin, transaction }
 * @returns {Promise<Object>}
 */
async function create({ fecha, horaInicio, horaFin, duracionMin, transaction }) {
  const pool = await getPool();
  const request = transaction ? transaction.request() : pool.request();

  const result = await request
    .input('Fecha', sql.Date, fecha)
    .input('HoraInicio', sql.VarChar(8), horaInicio)
    .input('HoraFin', sql.VarChar(8), horaFin)
    .input('DuracionMin', sql.Int, duracionMin)
    .query(`
      INSERT INTO dbo.Agendas (Fecha, HoraInicio, HoraFin, DuracionMin)
      OUTPUT 
        INSERTED.AgendaID     AS agendaID,
        INSERTED.Fecha        AS fecha,
        INSERTED.HoraInicio   AS horaInicio,
        INSERTED.HoraFin      AS horaFin,
        INSERTED.DuracionMin  AS duracionMin,
        INSERTED.Estado       AS estado,
        INSERTED.FechaCreacion AS fechaCreacion
      VALUES (@Fecha, @HoraInicio, @HoraFin, @DuracionMin)
    `);

  return result.recordset[0];
}

module.exports = {
  findByBloque,
  create,
};
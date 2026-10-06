// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Modelo de Clientes: acceso a datos en SQL Server.
// =====================================================================

const { getPool, sql } = require('../config/database');

/**
 * Busca un cliente por email.
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
async function findByEmail(email) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Email', sql.NVarChar(150), email)
    .query(`
      SELECT 
        ClienteID       AS clienteID,
        Nombre          AS nombre,
        Apellido        AS apellido,
        Email           AS email,
        Telefono        AS telefono,
        Preferencias    AS preferencias,
        EsVIP           AS esVIP,
        FechaRegistro   AS fechaRegistro
      FROM dbo.Clientes
      WHERE Email = @Email
    `);

  return result.recordset[0] || null;
}

/**
 * Busca un cliente por ID.
 * @param {number} clienteID
 * @returns {Promise<Object|null>}
 */
async function findById(clienteID) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('ClienteID', sql.Int, clienteID)
    .query(`
      SELECT 
        ClienteID       AS clienteID,
        Nombre          AS nombre,
        Apellido        AS apellido,
        Email           AS email,
        Telefono        AS telefono,
        Preferencias    AS preferencias,
        EsVIP           AS esVIP,
        FechaRegistro   AS fechaRegistro
      FROM dbo.Clientes
      WHERE ClienteID = @ClienteID
    `);

  return result.recordset[0] || null;
}

/**
 * Crea un cliente nuevo.
 * @param {Object} data - { nombre, apellido, email, telefono, preferencias, esVIP }
 * @returns {Promise<Object>} Cliente creado
 */
async function create(data) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Nombre', sql.NVarChar(100), data.nombre)
    .input('Apellido', sql.NVarChar(100), data.apellido)
    .input('Email', sql.NVarChar(150), data.email)
    .input('Telefono', sql.NVarChar(20), data.telefono || null)
    .input('Preferencias', sql.NVarChar(500), data.preferencias || null)
    .input('EsVIP', sql.Bit, data.esVIP ? 1 : 0)
    .query(`
      INSERT INTO dbo.Clientes (Nombre, Apellido, Email, Telefono, Preferencias, EsVIP)
      OUTPUT 
        INSERTED.ClienteID     AS clienteID,
        INSERTED.Nombre        AS nombre,
        INSERTED.Apellido      AS apellido,
        INSERTED.Email         AS email,
        INSERTED.Telefono      AS telefono,
        INSERTED.Preferencias  AS preferencias,
        INSERTED.EsVIP         AS esVIP,
        INSERTED.FechaRegistro AS fechaRegistro
      VALUES (@Nombre, @Apellido, @Email, @Telefono, @Preferencias, @EsVIP)
    `);

  return result.recordset[0];
}

module.exports = {
  findByEmail,
  findById,
  create,
};
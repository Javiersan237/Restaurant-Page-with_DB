// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Modelo de Reservaciones: acceso a datos en SQL Server.
// =====================================================================

const { getPool, sql } = require('../config/database');

/**
 * Cuenta cuantas reservaciones activas se solapan en una mesa.
 * Usado para validar doble reservacion.
 *
 * @param {Object} params - { mesaID, fecha, horaInicio, horaFin, transaction }
 * @returns {Promise<number>}
 */
async function countSolapamientosMesa({ mesaID, fecha, horaInicio, horaFin, transaction }) {
  const pool = await getPool();
  const request = transaction ? transaction.request() : pool.request();

  const result = await request
    .input('MesaID', sql.Int, mesaID)
    .input('Fecha', sql.Date, fecha)
    .input('HoraInicio', sql.VarChar(8), horaInicio)
    .input('HoraFin', sql.VarChar(8), horaFin)
    .query(`
      SELECT COUNT(*) AS total
      FROM dbo.Reservaciones r WITH (UPDLOCK, HOLDLOCK)
      INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
      WHERE r.MesaID = @MesaID
        AND a.Fecha = @Fecha
        AND a.HoraInicio < @HoraFin
        AND a.HoraFin    > @HoraInicio
        AND r.Estado IN ('Pendiente', 'Confirmada')
    `);

  return result.recordset[0].total;
}

/**
 * Suma las personas reservadas en un bloque (todas las mesas).
 * Usado para validar la capacidad global del restaurante (50 personas).
 *
 * @param {Object} params - { fecha, horaInicio, horaFin, transaction }
 * @returns {Promise<number>}
 */
async function sumPersonasEnBloque({ fecha, horaInicio, horaFin, transaction }) {
  const pool = await getPool();
  const request = transaction ? transaction.request() : pool.request();

  const result = await request
    .input('Fecha', sql.Date, fecha)
    .input('HoraInicio', sql.VarChar(8), horaInicio)
    .input('HoraFin', sql.VarChar(8), horaFin)
    .query(`
      SELECT ISNULL(SUM(r.NumeroPersonas), 0) AS total
      FROM dbo.Reservaciones r WITH (UPDLOCK, HOLDLOCK)
      INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
      WHERE a.Fecha = @Fecha
        AND a.HoraInicio < @HoraFin
        AND a.HoraFin    > @HoraInicio
        AND r.Estado IN ('Pendiente', 'Confirmada')
    `);

  return result.recordset[0].total;
}

/**
 * Obtiene la capacidad de una mesa.
 * @param {number} mesaID
 * @returns {Promise<number|null>}
 */
async function getCapacidadMesa(mesaID) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MesaID', sql.Int, mesaID)
    .query(`SELECT Capacidad FROM dbo.Mesas WHERE MesaID = @MesaID`);

  return result.recordset[0] ? result.recordset[0].Capacidad : null;
}

/**
 * Crea una reservacion y devuelve el detalle completo (con JOINs).
 * @param {Object} params - { clienteID, mesaID, agendaID, numeroPersonas, notas, transaction }
 * @returns {Promise<Object>}
 */
async function create({ clienteID, mesaID, agendaID, numeroPersonas, notas, transaction }) {
  const pool = await getPool();
  const request = transaction ? transaction.request() : pool.request();

  const result = await request
    .input('ClienteID', sql.Int, clienteID)
    .input('MesaID', sql.Int, mesaID)
    .input('AgendaID', sql.Int, agendaID)
    .input('NumeroPersonas', sql.Int, numeroPersonas)
    .input('Notas', sql.NVarChar(300), notas || null)
    .query(`
      INSERT INTO dbo.Reservaciones (ClienteID, MesaID, AgendaID, NumeroPersonas, Notas)
      OUTPUT INSERTED.ReservacionID
      VALUES (@ClienteID, @MesaID, @AgendaID, @NumeroPersonas, @Notas)
    `);

  return result.recordset[0].ReservacionID;
}

/**
 * Obtiene una reservacion completa con datos de cliente, mesa y agenda.
 * @param {number} reservacionID
 * @param {Object} transaction
 * @returns {Promise<Object|null>}
 */
async function findById(reservacionID, transaction = null) {
  const pool = await getPool();
  const request = transaction ? transaction.request() : pool.request();

  const result = await request
    .input('ReservacionID', sql.Int, reservacionID)
    .query(`
      SELECT 
        r.ReservacionID     AS reservacionID,
        r.NumeroPersonas    AS numeroPersonas,
        r.Estado            AS estado,
        r.Notas             AS notas,
        r.FechaCreacion     AS fechaCreacion,
        c.ClienteID         AS clienteID,
        c.Nombre            AS clienteNombre,
        c.Apellido          AS clienteApellido,
        c.Email             AS clienteEmail,
        c.Telefono          AS clienteTelefono,
        m.MesaID            AS mesaID,
        m.NumeroMesa        AS numeroMesa,
        m.Capacidad         AS mesaCapacidad,
        m.Ubicacion         AS mesaUbicacion,
        a.AgendaID          AS agendaID,
        a.Fecha             AS agendaFecha,
        a.HoraInicio        AS agendaHoraInicio,
        a.HoraFin           AS agendaHoraFin,
        a.DuracionMin       AS agendaDuracionMin
      FROM dbo.Reservaciones r
      INNER JOIN dbo.Clientes c ON c.ClienteID = r.ClienteID
      INNER JOIN dbo.Mesas    m ON m.MesaID    = r.MesaID
      INNER JOIN dbo.Agendas  a ON a.AgendaID  = r.AgendaID
      WHERE r.ReservacionID = @ReservacionID
    `);

  if (!result.recordset[0]) return null;

  return formatearReservacion(result.recordset[0]);
}

/**
 * Transforma el recordset plano en un objeto anidado.
 * Formatea fecha (YYYY-MM-DD) y horas (HH:MM) correctamente.
 */
function formatearReservacion(row) {
  const formatFecha = (d) => {
    if (!d) return null;
    const date = new Date(d);
    return date.toISOString().split('T')[0];
  };

  const formatHora = (t) => {
    if (!t) return null;
    const date = new Date(t);
    const horas = String(date.getUTCHours()).padStart(2, '0');
    const minutos = String(date.getUTCMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  return {
    reservacionID: row.reservacionID,
    numeroPersonas: row.numeroPersonas,
    estado: row.estado,
    notas: row.notas,
    fechaCreacion: row.fechaCreacion,
    cliente: {
      clienteID: row.clienteID,
      nombre: row.clienteNombre,
      apellido: row.clienteApellido,
      email: row.clienteEmail,
      telefono: row.clienteTelefono,
    },
    mesa: {
      mesaID: row.mesaID,
      numeroMesa: row.numeroMesa,
      capacidad: row.mesaCapacidad,
      ubicacion: row.mesaUbicacion,
    },
    agenda: {
      agendaID: row.agendaID,
      fecha: formatFecha(row.agendaFecha),
      horaInicio: formatHora(row.agendaHoraInicio),
      horaFin: formatHora(row.agendaHoraFin),
      duracionMin: row.agendaDuracionMin,
    },
  };
}

module.exports = {
  countSolapamientosMesa,
  sumPersonasEnBloque,
  getCapacidadMesa,
  create,
  findById,
  formatearReservacion,
};
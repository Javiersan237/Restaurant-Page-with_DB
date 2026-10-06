// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Controlador del panel de administrador.
// =====================================================================

const { getPool, sql } = require('../config/database');
const reservacionesService = require('../services/reservaciones.service');

/**
 * Formatea una fecha (DATE de SQL Server) como "YYYY-MM-DD".
 */
function formatFecha(d) {
  if (!d) return null;
  const date = new Date(d);
  return date.toISOString().split('T')[0];
}

/**
 * Formatea una hora (TIME de SQL Server) como "HH:MM".
 */
function formatHora(t) {
  if (!t) return null;
  const date = new Date(t);
  const horas = String(date.getUTCHours()).padStart(2, '0');
  const minutos = String(date.getUTCMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

/**
 * GET /api/admin/reservaciones
 */
async function listarReservaciones(req, res, next) {
  try {
    const filtros = {
      estado: req.query.estado,
      fecha: req.query.fecha,
    };

    const pool = await getPool();
    const request = pool.request();

    let query = `
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
        c.EsVIP             AS clienteEsVIP,
        m.MesaID            AS mesaID,
        m.NumeroMesa        AS numeroMesa,
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
      WHERE 1 = 1
    `;

    if (filtros.estado) {
      request.input('Estado', sql.NVarChar(20), filtros.estado);
      query += ' AND r.Estado = @Estado';
    }

    if (filtros.fecha) {
      request.input('Fecha', sql.Date, filtros.fecha);
      query += ' AND a.Fecha = @Fecha';
    }

    query += ' ORDER BY a.Fecha DESC, a.HoraInicio DESC';

    const result = await request.query(query);

    const reservaciones = result.recordset.map((row) => ({
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
        esVIP: row.clienteEsVIP,
      },
      mesa: {
        mesaID: row.mesaID,
        numeroMesa: row.numeroMesa,
        ubicacion: row.mesaUbicacion,
      },
      agenda: {
        agendaID: row.agendaID,
        fecha: formatFecha(row.agendaFecha),
        horaInicio: formatHora(row.agendaHoraInicio),
        horaFin: formatHora(row.agendaHoraFin),
        duracionMin: row.agendaDuracionMin,
      },
    }));

    res.json({
      data: reservaciones,
      meta: { total: reservaciones.length, filtros },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/reservaciones/:id/estado
 */
async function cambiarEstadoReservacion(req, res, next) {
  try {
    const reservacion = await reservacionesService.cambiarEstado(
      req.params.id,
      req.body.estado,
    );

    res.json({
      data: reservacion,
      meta: { message: `Estado cambiado a '${reservacion.estado}'` },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/clientes
 */
async function listarClientes(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        ClienteID       AS clienteID,
        Nombre          AS nombre,
        Apellido        AS apellido,
        Email           AS email,
        Telefono        AS telefono,
        EsVIP           AS esVIP,
        Activo          AS activo,
        FechaRegistro   AS fechaRegistro,
        UltimoLogin     AS ultimoLogin
      FROM dbo.Clientes
      ORDER BY FechaRegistro DESC
    `);

    res.json({
      data: result.recordset,
      meta: { total: result.recordset.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/stats
 */
async function estadisticas(req, res, next) {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM dbo.Clientes)                    AS totalClientes,
        (SELECT COUNT(*) FROM dbo.Mesas)                       AS totalMesas,
        (SELECT COUNT(*) FROM dbo.Reservaciones)               AS totalReservaciones,
        (SELECT COUNT(*) FROM dbo.Reservaciones WHERE Estado = 'Pendiente')  AS pendientes,
        (SELECT COUNT(*) FROM dbo.Reservaciones WHERE Estado = 'Confirmada') AS confirmadas,
        (SELECT COUNT(*) FROM dbo.Reservaciones WHERE Estado = 'Completada') AS completadas,
        (SELECT COUNT(*) FROM dbo.Reservaciones WHERE Estado = 'Cancelada')  AS canceladas
    `);

    res.json({
      data: result.recordset[0],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarReservaciones,
  cambiarEstadoReservacion,
  listarClientes,
  estadisticas,
};
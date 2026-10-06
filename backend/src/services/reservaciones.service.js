// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Servicio de Reservaciones: logica de negocio + transacciones.
// =====================================================================

const { getPool, sql } = require('../config/database');
const reservacionModel = require('../models/reservacion.model');
const agendaModel = require('../models/agenda.model');
const clienteModel = require('../models/cliente.model');

const CAPACIDAD_GLOBAL_RESTAURANTE = 50;
const HORA_APERTURA = 8;
const HORA_CIERRE = 23;

/**
 * Calcula la hora de fin a partir de la hora de inicio + duracion.
 */
function calcularHoraFin(horaInicio, duracionMin) {
  const [horas, minutos] = horaInicio.split(':').map(Number);
  const totalMinutos = horas * 60 + minutos + duracionMin;
  const horaFinHoras = Math.floor(totalMinutos / 60);
  const horaFinMinutos = totalMinutos % 60;
  return `${String(horaFinHoras).padStart(2, '0')}:${String(horaFinMinutos).padStart(2, '0')}`;
}

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
 * Valida el body del request de creacion de reservacion.
 */
function validarBody(body) {
  const errores = [];

  if (!body.mesaID) {
    errores.push({ field: 'mesaID', message: 'El mesaID es requerido' });
  }

  if (!body.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(body.fecha)) {
    errores.push({ field: 'fecha', message: 'La fecha es requerida en formato YYYY-MM-DD' });
  }

  if (!body.horaInicio || !/^\d{2}:\d{2}$/.test(body.horaInicio)) {
    errores.push({ field: 'horaInicio', message: 'La horaInicio es requerida en formato HH:MM' });
  }

  const duracion = parseInt(body.duracionMin, 10);
  if (Number.isNaN(duracion) || duracion < 30 || duracion > 180) {
    errores.push({ field: 'duracionMin', message: 'duracionMin debe estar entre 30 y 180' });
  }

  const personas = parseInt(body.numeroPersonas, 10);
  if (Number.isNaN(personas) || personas < 1 || personas > 20) {
    errores.push({ field: 'numeroPersonas', message: 'numeroPersonas debe estar entre 1 y 20' });
  }

  if (errores.length > 0) {
    const error = new Error('Errores de validacion en el request');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = errores;
    throw error;
  }
}

/**
 * Crea una reservacion con validaciones completas en transaccion.
 */
async function crear(body, clienteID) {
  validarBody(body);

  if (!clienteID) {
    const error = new Error('Se requiere autenticacion para crear una reservacion');
    error.status = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const cliente = await clienteModel.findById(clienteID);
  if (!cliente) {
    const error = new Error(`No existe el cliente con ID ${clienteID}`);
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const duracion = parseInt(body.duracionMin, 10);
  const personas = parseInt(body.numeroPersonas, 10);

  // Validar fecha futura
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaReserva = new Date(body.fecha + 'T00:00:00');
  if (fechaReserva < hoy) {
    const error = new Error('No se puede reservar en una fecha pasada');
    error.status = 422;
    error.code = 'DATE_IN_PAST';
    throw error;
  }

  const horaFin = calcularHoraFin(body.horaInicio, duracion);

  const horaFinNum = parseInt(horaFin.split(':')[0], 10);
  if (horaFinNum > HORA_CIERRE) {
    const error = new Error(`El horario excede el cierre del restaurante (${HORA_CIERRE}:00)`);
    error.status = 422;
    error.code = 'INVALID_DURATION';
    throw error;
  }

  const capacidadMesa = await reservacionModel.getCapacidadMesa(body.mesaID);
  if (capacidadMesa === null) {
    const error = new Error(`No existe la mesa con ID ${body.mesaID}`);
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (personas > capacidadMesa) {
    const error = new Error(`La mesa tiene capacidad para ${capacidadMesa}, se solicitaron ${personas}`);
    error.status = 422;
    error.code = 'CAPACITY_EXCEEDED';
    throw error;
  }

  // ===== TRANSACCION =====
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    // 1. Verificar solapamiento POR MESA
    const solapamientos = await reservacionModel.countSolapamientosMesa({
      mesaID: body.mesaID,
      fecha: body.fecha,
      horaInicio: body.horaInicio,
      horaFin,
      transaction,
    });

    if (solapamientos > 0) {
      await transaction.rollback();
      const error = new Error('La mesa ya esta reservada en un horario que se solapa');
      error.status = 409;
      error.code = 'TABLE_ALREADY_RESERVED';
      throw error;
    }

    // 2. Verificar capacidad global
    const personasOcupadas = await reservacionModel.sumPersonasEnBloque({
      fecha: body.fecha,
      horaInicio: body.horaInicio,
      horaFin,
      transaction,
    });

    if (personasOcupadas + personas > CAPACIDAD_GLOBAL_RESTAURANTE) {
      await transaction.rollback();
      const error = new Error(
        `El restaurante alcanzo su capacidad maxima (${CAPACIDAD_GLOBAL_RESTAURANTE} personas) en ese horario`,
      );
      error.status = 409;
      error.code = 'RESTAURANT_FULL';
      throw error;
    }

    // 3. Buscar o crear agenda
    let agenda = await agendaModel.findByBloque({
      fecha: body.fecha,
      horaInicio: body.horaInicio,
      horaFin,
      transaction,
    });

    let agendaCreada = false;
    if (!agenda) {
      agenda = await agendaModel.create({
        fecha: body.fecha,
        horaInicio: body.horaInicio,
        horaFin,
        duracionMin: duracion,
        transaction,
      });
      agendaCreada = true;
    }

    // 4. Insertar reservacion
    const reservacionID = await reservacionModel.create({
      clienteID,
      mesaID: body.mesaID,
      agendaID: agenda.agendaID,
      numeroPersonas: personas,
      notas: body.notas,
      transaction,
    });

    // 5. Commit
    await transaction.commit();

    // 6. Obtener la reservacion completa
    const reservacion = await reservacionModel.findById(reservacionID);

    return { reservacion, agendaCreada };
  } catch (err) {
    if (transaction._aborted !== true) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        console.error('Error haciendo rollback:', rollbackErr.message);
      }
    }
    throw err;
  }
}

/**
 * Obtiene una reservacion por ID.
 */
async function obtenerPorId(reservacionID) {
  const id = parseInt(reservacionID, 10);
  if (Number.isNaN(id) || id < 1) {
    const error = new Error('reservacionID debe ser un numero positivo');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const reservacion = await reservacionModel.findById(id);
  if (!reservacion) {
    const error = new Error(`No se encontro la reservacion con ID ${id}`);
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return reservacion;
}

// Mapa de transiciones permitidas por estado
const TRANSICIONES = {
  Pendiente: ['Confirmada', 'Cancelada'],
  Confirmada: ['Completada', 'Cancelada', 'NoShow'],
  Cancelada: [],
  Completada: [],
  NoShow: [],
};

const ESTADOS_VALIDOS = ['Pendiente', 'Confirmada', 'Cancelada', 'Completada', 'NoShow'];

/**
 * Cambia el estado de una reservacion con validacion de transiciones.
 */
async function cambiarEstado(reservacionID, nuevoEstado) {
  const id = parseInt(reservacionID, 10);
  if (Number.isNaN(id) || id < 1) {
    const error = new Error('reservacionID debe ser un numero positivo');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (!nuevoEstado || !ESTADOS_VALIDOS.includes(nuevoEstado)) {
    const error = new Error(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const estadoActual = await reservacionModel.getEstado(id);
  if (!estadoActual) {
    const error = new Error(`No se encontro la reservacion con ID ${id}`);
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const permitidos = TRANSICIONES[estadoActual] || [];
  if (!permitidos.includes(nuevoEstado)) {
    const error = new Error(
      `No se puede pasar de '${estadoActual}' a '${nuevoEstado}'`,
    );
    error.status = 422;
    error.code = 'INVALID_STATE_TRANSITION';
    error.details = {
      estadoActual,
      estadoSolicitado: nuevoEstado,
      transicionesPermitidas: permitidos,
    };
    throw error;
  }

  await reservacionModel.updateEstado(id, nuevoEstado);

  return reservacionModel.findById(id);
}

/**
 * Obtiene todas las reservaciones de un cliente.
 */
async function listarPorCliente(clienteID) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('ClienteID', sql.Int, clienteID)
    .query(`
      SELECT 
        r.ReservacionID     AS reservacionID,
        r.NumeroPersonas    AS numeroPersonas,
        r.Estado            AS estado,
        r.Notas             AS notas,
        r.FechaCreacion     AS fechaCreacion,
        m.MesaID            AS mesaID,
        m.NumeroMesa        AS numeroMesa,
        m.Ubicacion         AS mesaUbicacion,
        a.AgendaID          AS agendaID,
        a.Fecha             AS agendaFecha,
        a.HoraInicio        AS agendaHoraInicio,
        a.HoraFin           AS agendaHoraFin,
        a.DuracionMin       AS agendaDuracionMin
      FROM dbo.Reservaciones r
      INNER JOIN dbo.Mesas   m ON m.MesaID   = r.MesaID
      INNER JOIN dbo.Agendas a ON a.AgendaID = r.AgendaID
      WHERE r.ClienteID = @ClienteID
      ORDER BY a.Fecha DESC, a.HoraInicio DESC
    `);

  return result.recordset.map((row) => ({
    reservacionID: row.reservacionID,
    numeroPersonas: row.numeroPersonas,
    estado: row.estado,
    notas: row.notas,
    fechaCreacion: row.fechaCreacion,
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
}

/**
 * Cancela una reservacion del cliente.
 */
async function cancelarPropia(reservacionID, clienteID) {
  const pool = await getPool();

  const check = await pool
    .request()
    .input('ReservacionID', sql.Int, reservacionID)
    .input('ClienteID', sql.Int, clienteID)
    .query(`
      SELECT Estado FROM dbo.Reservaciones
      WHERE ReservacionID = @ReservacionID AND ClienteID = @ClienteID
    `);

  if (check.recordset.length === 0) {
    const error = new Error('No se encontro la reservacion o no te pertenece');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const estadoActual = check.recordset[0].Estado;

  if (estadoActual === 'Cancelada' || estadoActual === 'Completada' || estadoActual === 'NoShow') {
    const error = new Error(`No se puede cancelar una reservacion en estado ${estadoActual}`);
    error.status = 422;
    error.code = 'INVALID_STATE_TRANSITION';
    throw error;
  }

  await pool
    .request()
    .input('ReservacionID', sql.Int, reservacionID)
    .query(`UPDATE dbo.Reservaciones SET Estado = 'Cancelada' WHERE ReservacionID = @ReservacionID`);

  return reservacionModel.findById(reservacionID);
}

module.exports = {
  crear,
  obtenerPorId,
  cambiarEstado,
  listarPorCliente,
  cancelarPropia,
};
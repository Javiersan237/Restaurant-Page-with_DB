// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Servicio de Reservaciones: logica de negocio + transacciones.
// =====================================================================

const { getPool, sql } = require('../config/database');
const reservacionModel = require('../models/reservacion.model');
const agendaModel = require('../models/agenda.model');
const clienteModel = require('../models/cliente.model');
const clientesService = require('./clientes.service');

const CAPACIDAD_GLOBAL_RESTAURANTE = 50;
const HORA_APERTURA = 8;
const HORA_CIERRE = 23;

/**
 * Calcula la hora de fin a partir de la hora de inicio + duracion.
 * @param {string} horaInicio - Formato "HH:MM"
 * @param {number} duracionMin
 * @returns {string} Formato "HH:MM"
 */
function calcularHoraFin(horaInicio, duracionMin) {
  const [horas, minutos] = horaInicio.split(':').map(Number);
  const totalMinutos = horas * 60 + minutos + duracionMin;
  const horaFinHoras = Math.floor(totalMinutos / 60);
  const horaFinMinutos = totalMinutos % 60;
  return `${String(horaFinHoras).padStart(2, '0')}:${String(horaFinMinutos).padStart(2, '0')}`;
}

/**
 * Valida el body del request de creacion de reservacion.
 * @param {Object} body
 */
function validarBody(body) {
  const errores = [];

  // Cliente: clienteID o cliente
  if (!body.clienteID && !body.cliente) {
    errores.push({ field: 'clienteID', message: 'Debes enviar clienteID o cliente' });
  }

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
 * @param {Object} body
 * @returns {Promise<Object>} { reservacion, agendaCreada }
 */
async function crear(body) {
  validarBody(body);

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

  // Calcular horaFin
  const horaFin = calcularHoraFin(body.horaInicio, duracion);

  // Validar rango horario del restaurante
  const horaFinNum = parseInt(horaFin.split(':')[0], 10);
  if (horaFinNum > HORA_CIERRE) {
    const error = new Error(`El horario excede el cierre del restaurante (${HORA_CIERRE}:00)`);
    error.status = 422;
    error.code = 'INVALID_DURATION';
    throw error;
  }

  // Resolver clienteID
  let clienteID = body.clienteID;
  if (!clienteID && body.cliente) {
    const resultado = await clientesService.crearObtener(body.cliente);
    clienteID = resultado.cliente.clienteID;
  } else {
    // Verificar que el cliente existe
    const cliente = await clienteModel.findById(clienteID);
    if (!cliente) {
      const error = new Error(`No existe el cliente con ID ${clienteID}`);
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
  }

  // Verificar capacidad de la mesa
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
      const error = new Error(`El restaurante alcanzo su capacidad maxima (${CAPACIDAD_GLOBAL_RESTAURANTE} personas) en ese horario`);
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

module.exports = {
  crear,
};
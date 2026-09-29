// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Servicio de Mesas: logica de negocio.
// =====================================================================

const mesaModel = require('../models/mesa.model');

/**
 * Lista mesas aplicando filtros y validaciones.
 * @param {Object} filtros
 * @returns {Promise<Array>}
 */
async function listar(filtros) {
  const filtrosLimpios = {};

  if (filtros.ubicacion) {
    filtrosLimpios.ubicacion = String(filtros.ubicacion).trim();
  }

  if (filtros.capacidadMinima) {
    const capacidad = parseInt(filtros.capacidadMinima, 10);
    if (Number.isNaN(capacidad) || capacidad < 1) {
      const error = new Error('capacidadMinima debe ser un numero positivo');
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    filtrosLimpios.capacidadMinima = capacidad;
  }

  if (filtros.estado) {
    const estadosValidos = ['Disponible', 'Ocupada', 'Reservada', 'Mantenimiento'];
    const estado = String(filtros.estado).trim();
    if (!estadosValidos.includes(estado)) {
      const error = new Error(`estado debe ser uno de: ${estadosValidos.join(', ')}`);
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    filtrosLimpios.estado = estado;
  }

  return mesaModel.findAll(filtrosLimpios);
}

/**
 * Obtiene una mesa por ID.
 * @param {number} mesaID
 * @returns {Promise<Object>}
 */
async function obtenerPorId(mesaID) {
  const id = parseInt(mesaID, 10);
  if (Number.isNaN(id) || id < 1) {
    const error = new Error('mesaID debe ser un numero positivo');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const mesa = await mesaModel.findById(id);
  if (!mesa) {
    const error = new Error(`No se encontro la mesa con ID ${id}`);
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return mesa;
}

/**
 * Lista mesas disponibles para un bloque de tiempo.
 * Valida todos los parámetros de entrada.
 *
 * @param {Object} params - { fecha, horaInicio, duracionMin, personas }
 * @returns {Promise<Object>} { mesas, consulta }
 */
async function listarDisponibles({ fecha, horaInicio, duracionMin, personas }) {
  // Validar fecha
  if (!fecha) {
    const error = new Error('El parametro fecha es requerido (YYYY-MM-DD)');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!fechaRegex.test(fecha)) {
    const error = new Error('Formato de fecha invalido. Use YYYY-MM-DD');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Validar horaInicio
  if (!horaInicio) {
    const error = new Error('El parametro horaInicio es requerido (HH:MM)');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const horaRegex = /^\d{2}:\d{2}$/;
  if (!horaRegex.test(horaInicio)) {
    const error = new Error('Formato de horaInicio invalido. Use HH:MM');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Validar duracionMin
  const duracion = parseInt(duracionMin, 10);
  if (Number.isNaN(duracion) || duracion < 30 || duracion > 180) {
    const error = new Error('duracionMin debe estar entre 30 y 180 minutos');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Validar personas
  const numPersonas = parseInt(personas, 10);
  if (Number.isNaN(numPersonas) || numPersonas < 1 || numPersonas > 20) {
    const error = new Error('personas debe estar entre 1 y 20');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Calcular horaFin
  const [horas, minutos] = horaInicio.split(':').map(Number);
  const totalMinutos = horas * 60 + minutos + duracion;
  const horaFinHoras = Math.floor(totalMinutos / 60);
  const horaFinMinutos = totalMinutos % 60;

  if (horaFinHoras > 23) {
    const error = new Error('El horario excede las 23:00 (cierre del restaurante)');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const horaFin = `${String(horaFinHoras).padStart(2, '0')}:${String(horaFinMinutos).padStart(2, '0')}`;

  // Buscar mesas disponibles
  const mesas = await mesaModel.findDisponibles({
    fecha,
    horaInicio,
    horaFin,
    personas: numPersonas,
  });

  return {
    mesas,
    consulta: {
      fecha,
      horaInicio,
      horaFin,
      duracionMin: duracion,
      personas: numPersonas,
    },
  };
}

module.exports = {
  listar,
  obtenerPorId,
  listarDisponibles,
};
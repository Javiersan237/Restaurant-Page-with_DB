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

module.exports = {
  listar,
  obtenerPorId,
};
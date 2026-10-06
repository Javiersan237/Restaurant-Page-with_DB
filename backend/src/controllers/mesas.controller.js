// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Controlador de Mesas: manejo de HTTP request/response.
// =====================================================================

const mesasService = require('../services/mesas.service');

/**
 * GET /api/mesas
 * Lista todas las mesas con filtros opcionales.
 */
async function listar(req, res, next) {
  try {
    const filtros = {
      ubicacion: req.query.ubicacion,
      capacidadMinima: req.query.capacidadMinima,
      estado: req.query.estado,
    };

    const mesas = await mesasService.listar(filtros);

    res.json({
      data: mesas,
      meta: {
        total: mesas.length,
        filtros: filtros,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/mesas/:id
 * Obtiene una mesa por ID.
 */
async function obtenerPorId(req, res, next) {
  try {
    const mesa = await mesasService.obtenerPorId(req.params.id);

    res.json({
      data: mesa,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/mesas/disponibles
 * Lista mesas disponibles para una fecha, hora y duración específicas.
 */
async function listarDisponibles(req, res, next) {
  try {
    const params = {
      fecha: req.query.fecha,
      horaInicio: req.query.horaInicio,
      duracionMin: req.query.duracionMin,
      personas: req.query.personas,
    };

    const resultado = await mesasService.listarDisponibles(params);

    res.json({
      data: resultado.mesas,
      meta: {
        total: resultado.mesas.length,
        consulta: resultado.consulta,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar,
  obtenerPorId,
  listarDisponibles,
};
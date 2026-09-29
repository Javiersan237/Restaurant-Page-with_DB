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

module.exports = {
  listar,
  obtenerPorId,
};
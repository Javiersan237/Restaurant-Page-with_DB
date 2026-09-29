// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Controlador de Reservaciones.
// =====================================================================

const reservacionesService = require('../services/reservaciones.service');

/**
 * POST /api/reservaciones
 * Crea una reservacion con validaciones completas.
 */
async function crear(req, res, next) {
  try {
    const { reservacion, agendaCreada } = await reservacionesService.crear(req.body);

    res.status(201).json({
      data: reservacion,
      meta: {
        agendaCreada,
        message: 'Reservacion creada exitosamente',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reservaciones/:id
 * Obtiene una reservacion por ID.
 */
async function obtenerPorId(req, res, next) {
  try {
    const reservacion = await reservacionesService.obtenerPorId(req.params.id);

    res.json({
      data: reservacion,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/reservaciones/:id/estado
 * Cambia el estado de una reservacion.
 */
async function cambiarEstado(req, res, next) {
  try {
    const reservacion = await reservacionesService.cambiarEstado(
      req.params.id,
      req.body.estado,
    );

    res.json({
      data: reservacion,
      meta: {
        message: `Estado cambiado a '${reservacion.estado}'`,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crear,
  obtenerPorId,
  cambiarEstado,
};
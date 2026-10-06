// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Controlador de endpoints para el cliente logueado.
// =====================================================================

const reservacionesService = require('../services/reservaciones.service');

/**
 * GET /api/cliente/reservaciones
 */
async function misReservaciones(req, res, next) {
  try {
    const reservaciones = await reservacionesService.listarPorCliente(req.user.userID);

    res.json({
      data: reservaciones,
      meta: { total: reservaciones.length },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/cliente/reservaciones/:id/cancelar
 */
async function cancelarReservacion(req, res, next) {
  try {
    const reservacion = await reservacionesService.cancelarPropia(
      req.params.id,
      req.user.userID,
    );

    res.json({
      data: reservacion,
      meta: { message: 'Reservacion cancelada' },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  misReservaciones,
  cancelarReservacion,
};
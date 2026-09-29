// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Middleware para rutas no encontradas (404).
// =====================================================================

/**
 * Captura cualquier request que no haya coincidido con una ruta valida.
 */
function notFoundHandler(req, res, _next) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
}

module.exports = notFoundHandler;
// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Middleware centralizado de manejo de errores.
// =====================================================================

const logger = require('../utils/logger');

/**
 * Middleware de manejo de errores.
 * Captura errores y devuelve un formato estandar.
 */
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const isProduction = process.env.NODE_ENV === 'production';

  // Log del error (siempre)
  logger.error(err.message, {
    code,
    status,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: isProduction ? undefined : err.stack,
  });

  // Respuesta al cliente
  const response = {
    error: {
      code,
      message: err.message || 'Error interno del servidor',
    },
  };

  // Agregar detalles si existen
  if (err.details) {
    response.error.details = err.details;
  }

  // En desarrollo, agregar stack trace
  if (!isProduction && err.stack) {
    response.error.stack = err.stack.split('\n').map((line) => line.trim());
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
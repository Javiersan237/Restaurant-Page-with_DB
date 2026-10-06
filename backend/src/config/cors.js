// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Configuracion de CORS.
// =====================================================================

/**
 * Devuelve las opciones de CORS segun el entorno.
 * En desarrollo permite cualquier origen.
 * En produccion solo permite el origen del frontend.
 */
function getCorsOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!isProduction) {
    // Desarrollo: permitir todo
    return {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
  }

  // Produccion: whitelist estricta
  const allowedOrigins = frontendUrl.split(',').map((url) => url.trim());

  return {
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origen no permitido por CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

module.exports = { getCorsOptions };
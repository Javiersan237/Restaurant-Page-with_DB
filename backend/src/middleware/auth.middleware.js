// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Middleware de autenticacion con JWT.
// =====================================================================

const jwt = require('jsonwebtoken');
const { JWT } = require('../config/env');

/**
 * Verifica que el request tenga un JWT valido.
 * Inyecta req.user con el payload decodificado.
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token no proporcionado',
      },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'El token ha expirado. Inicia sesion nuevamente.',
        },
      });
    }

    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token invalido',
      },
    });
  }
}

/**
 * Verifica el token opcionalmente (sin bloquear si no existe).
 * Util para endpoints que funcionan con o sin sesion.
 */
function verificarTokenOpcional(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT.secret);
    req.user = decoded;
  } catch (_err) {
    // Token invalido, pero no bloqueamos
  }

  next();
}

module.exports = {
  verificarToken,
  verificarTokenOpcional,
};
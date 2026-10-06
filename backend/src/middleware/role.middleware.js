// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Middleware para validar roles (cliente / admin).
// Requiere que verificarToken se haya ejecutado antes.
// =====================================================================

/**
 * Permite el acceso solo si el usuario tiene uno de los roles indicados.
 * @param {...string} rolesPermitidos - Lista de roles permitidos
 */
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'No autenticado',
        },
      });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permisos para acceder a este recurso',
        },
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
};
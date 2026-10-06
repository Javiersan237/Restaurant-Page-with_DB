// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Controlador de autenticacion.
// =====================================================================

const authService = require('../services/auth.service');

/**
 * POST /api/auth/registro
 */
async function registro(req, res, next) {
  try {
    const resultado = await authService.registrarCliente(req.body);

    res.status(201).json({
      data: resultado,
      meta: { message: 'Registro exitoso' },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const resultado = await authService.loginCliente(email, password);

    res.json({
      data: resultado,
      meta: { message: 'Login exitoso' },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login-admin
 */
async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;
    const resultado = await authService.loginAdmin(email, password);

    res.json({
      data: resultado,
      meta: { message: 'Login de admin exitoso' },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const usuario = await authService.obtenerUsuarioActual(req.user.userID, req.user.role);

    res.json({ data: usuario });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * JWT es stateless; el logout real se hace borrando el token en el cliente.
 * Este endpoint existe solo como confirmación semántica.
 */
async function logout(req, res, _next) {
  res.json({
    data: null,
    meta: { message: 'Sesion cerrada. Borra el token en el cliente.' },
  });
}

module.exports = {
  registro,
  login,
  loginAdmin,
  me,
  logout,
};
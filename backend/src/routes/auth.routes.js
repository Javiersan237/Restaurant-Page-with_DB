// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Rutas de autenticacion.
// =====================================================================

const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Rate limiting especifico para login (previene brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 100,
  message: {
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Demasiados intentos. Espera 15 minutos.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rutas publicas
router.post('/registro', authController.registro);
router.post('/login', loginLimiter, authController.login);
router.post('/login-admin', loginLimiter, authController.loginAdmin);

// Rutas protegidas
router.get('/me', verificarToken, authController.me);
router.post('/logout', verificarToken, authController.logout);

module.exports = router;
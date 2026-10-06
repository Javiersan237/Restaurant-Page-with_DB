// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Rutas del cliente logueado.
// Requiere JWT con role 'cliente'.
// =====================================================================

const express = require('express');
const clienteController = require('../controllers/cliente.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

// Todas las rutas requieren token de cliente
router.use(verificarToken, requireRole('cliente'));

// GET /api/cliente/reservaciones
router.get('/reservaciones', clienteController.misReservaciones);

// PATCH /api/cliente/reservaciones/:id/cancelar
router.patch('/reservaciones/:id/cancelar', clienteController.cancelarReservacion);

module.exports = router;
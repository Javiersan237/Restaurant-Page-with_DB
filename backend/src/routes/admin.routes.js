// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Rutas del panel de administrador.
// Requiere JWT con role 'admin' o 'staff'.
// =====================================================================

const express = require('express');
const adminController = require('../controllers/admin.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

// Todas las rutas requieren token de admin o staff
router.use(verificarToken, requireRole('admin', 'staff'));

// GET /api/admin/stats
router.get('/stats', adminController.estadisticas);

// GET /api/admin/reservaciones
router.get('/reservaciones', adminController.listarReservaciones);

// PATCH /api/admin/reservaciones/:id/estado
router.patch('/reservaciones/:id/estado', adminController.cambiarEstadoReservacion);

// GET /api/admin/clientes
router.get('/clientes', adminController.listarClientes);

module.exports = router;
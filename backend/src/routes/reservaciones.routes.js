// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Rutas de Reservaciones.
// =====================================================================

const express = require('express');
const reservacionesController = require('../controllers/reservaciones.controller');

const router = express.Router();

// POST /api/reservaciones
router.post('/', reservacionesController.crear);

// GET /api/reservaciones/:id
router.get('/:id', reservacionesController.obtenerPorId);

module.exports = router;
// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Rutas de Mesas.
// =====================================================================

const express = require('express');
const mesasController = require('../controllers/mesas.controller');

const router = express.Router();

// GET /api/mesas
router.get('/', mesasController.listar);

// GET /api/mesas/:id
router.get('/:id', mesasController.obtenerPorId);

module.exports = router;
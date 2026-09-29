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

// GET /api/mesas/disponibles
// IMPORTANTE: debe ir ANTES de /:id para no ser capturado como ID
router.get('/disponibles', mesasController.listarDisponibles);

// GET /api/mesas/:id
router.get('/:id', mesasController.obtenerPorId);

module.exports = router;
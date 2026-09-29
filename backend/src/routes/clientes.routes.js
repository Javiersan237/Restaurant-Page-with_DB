// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Rutas de Clientes.
// =====================================================================

const express = require('express');
const clientesController = require('../controllers/clientes.controller');

const router = express.Router();

// POST /api/clientes
router.post('/', clientesController.crear);

// GET /api/clientes/:email
router.get('/:email', clientesController.obtenerPorEmail);

module.exports = router;
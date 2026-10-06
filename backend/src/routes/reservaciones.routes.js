// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Rutas de Reservaciones.
// =====================================================================

const express = require('express');
const reservacionesController = require('../controllers/reservaciones.controller');
const { verificarToken, verificarTokenOpcional } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/reservaciones
// Requiere autenticacion de cliente
router.post(
  '/',
  verificarToken,
  reservacionesController.crear,
);

// GET /api/reservaciones/:id
// Publico (para ver la confirmacion)
router.get('/:id', reservacionesController.obtenerPorId);

// PATCH /api/reservaciones/:id/estado
// Requiere autenticacion (admin o cliente segun la logica del controller)
router.patch(
  '/:id/estado',
  verificarToken,
  reservacionesController.cambiarEstado,
);

module.exports = router;
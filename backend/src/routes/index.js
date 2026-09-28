// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Enrutador principal. Agrupa todas las rutas de la API.
// =====================================================================

const express = require('express');
const router = express.Router();

// TODO: Descomentar a medida que se creen los enrutadores
// router.use('/clientes', require('./clientes.routes'));
// router.use('/mesas', require('./mesas.routes'));
// router.use('/reservaciones', require('./reservaciones.routes'));

router.get('/', (req, res) => {
  res.json({
    message: 'API ELYSEE Reservas v0.1.0',
    endpoints: {
      health: '/health',
      clientes: '/api/clientes (pendiente)',
      mesas: '/api/mesas (pendiente)',
      reservaciones: '/api/reservaciones (pendiente)',
    },
  });
});

module.exports = router;
// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Configuracion de Express: middlewares, rutas y manejo de errores.
// =====================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'elysee-reservas-backend',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'ELYSEE Reservas API',
    version: '0.1.0',
    documentation: '/api/docs',
    health: '/health',
  });
});

// TODO: Rutas de la API (se agregan en issues posteriores)
// app.use('/api/clientes', require('./routes/clientes.routes'));
// app.use('/api/mesas', require('./routes/mesas.routes'));
// app.use('/api/reservaciones', require('./routes/reservaciones.routes'));

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Error interno del servidor',
    },
  });
});

module.exports = app;
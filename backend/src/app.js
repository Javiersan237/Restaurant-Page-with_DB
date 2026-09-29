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

// ---------------------------------------------------------------------
// Endpoint temporal de prueba de conexion a la BD
// (se elimina cuando haya endpoints reales)
// ---------------------------------------------------------------------
app.get('/api/db-test', async (req, res, next) => {
  try {
    const { getPool } = require('./config/database');
    const pool = await getPool();

    const versionResult = await pool.request().query('SELECT @@VERSION AS version');
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    const mesasResult = await pool.request().query('SELECT COUNT(*) AS total FROM Mesas');

    res.json({
      status: 'ok',
      database: {
        version: versionResult.recordset[0].version.split('\n')[0],
        tables: tablesResult.recordset.map((t) => t.TABLE_NAME),
        mesas_count: mesasResult.recordset[0].total,
      },
    });
  } catch (err) {
    next(err);
  }
});

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
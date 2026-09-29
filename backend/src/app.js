// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Configuracion de Express: middlewares, rutas y manejo de errores.
// =====================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { getCorsOptions } = require('./config/cors');
const errorHandler = require('./middleware/error.middleware');
const notFoundHandler = require('./middleware/notFound.middleware');

const app = express();

// ---------------------------------------------------------------------
// Rate limiting (100 requests por 15 min por IP)
// ---------------------------------------------------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------------------------------------------------------
// Middlewares globales
// ---------------------------------------------------------------------
app.use(helmet());
app.use(cors(getCorsOptions()));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(limiter);

// ---------------------------------------------------------------------
// Rutas
// ---------------------------------------------------------------------

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'elysee-reservas-backend',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Raiz
app.get('/', (req, res) => {
  res.json({
    name: 'ELYSEE Reservas API',
    version: '0.1.0',
    documentation: '/api/docs',
    health: '/health',
  });
});


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

// Rutas de la API
app.use('/api/mesas', require('./routes/mesas.routes'));
app.use('/api/clientes', require('./routes/clientes.routes'));
app.use('/api/reservaciones', require('./routes/reservaciones.routes'));

// ---------------------------------------------------------------------
// Middlewares de cierre (SIEMPRE al final)
// ---------------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
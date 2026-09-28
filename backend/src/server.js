// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Punto de entrada del servidor. Levanta Express y escucha en el
// puerto definido en las variables de entorno.
// =====================================================================

require('dotenv').config();
const app = require('./app');
const { PORT } = require('./config/env');

const server = app.listen(PORT, () => {
  console.log('');
  console.log('=====================================================================');
  console.log('  ELYSEE RESERVAS - Backend');
  console.log('=====================================================================');
  console.log(`  Entorno    : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Puerto     : ${PORT}`);
  console.log(`  URL        : http://localhost:${PORT}`);
  console.log(`  Health     : http://localhost:${PORT}/health`);
  console.log('=====================================================================');
  console.log('');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('');
  console.log('SIGINT recibido (Ctrl+C). Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});

module.exports = server;
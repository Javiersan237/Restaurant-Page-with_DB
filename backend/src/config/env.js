// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Carga y validacion de variables de entorno.
// =====================================================================

require('dotenv').config();

const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
  console.warn('');
  console.warn('ADVERTENCIA: Faltan variables de entorno requeridas:');
  missing.forEach((key) => console.warn(`  - ${key}`));
  console.warn('Copia .env.example a .env y completa los valores.');
  console.warn('');
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,

  DB: {
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    database: process.env.DB_NAME || 'ElyseeDB',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    },
  },

  JWT: {
    secret: process.env.JWT_SECRET || 'dev-secret-cambiar-en-produccion',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};
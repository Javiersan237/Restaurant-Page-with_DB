// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Script de prueba de conexion a SQL Server.
// Uso: npm run test:db
// =====================================================================

require('dotenv').config();
const sql = require('mssql');
const { DB } = require('../src/config/env');

async function testConnection() {
  console.log('');
  console.log('=== Test de conexion a SQL Server ===');
  console.log(`  Servidor : ${DB.server}`);
  console.log(`  Puerto   : ${DB.port}`);
  console.log(`  Base     : ${DB.database}`);
  console.log(`  Usuario  : ${DB.user}`);
  console.log('');

  try {
    const pool = await sql.connect(DB);
    console.log('OK: Conexion establecida');

    const versionResult = await pool.request().query('SELECT @@VERSION AS version');
    console.log('');
    console.log('Version del servidor:');
    console.log('  ' + versionResult.recordset[0].version.split('\n')[0]);

    const dbResult = await pool.request().query('SELECT DB_NAME() AS dbname');
    console.log('Base de datos actual: ' + dbResult.recordset[0].dbname);

    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    console.log('');
    console.log('Tablas en la BD:');
    if (tablesResult.recordset.length === 0) {
      console.log('  (vacia - ejecuta las migraciones primero)');
    } else {
      tablesResult.recordset.forEach((t) => {
        console.log('  - ' + t.TABLE_NAME);
      });
    }

    const mesasResult = await pool.request().query('SELECT COUNT(*) AS total FROM Mesas');
    console.log('');
    console.log('Total de mesas en la BD: ' + mesasResult.recordset[0].total);

    await pool.close();
    console.log('');
    console.log('OK: Test completado con exito.');
    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('ERROR: ' + err.message);
    console.error('');
    console.error('Verifica:');
    console.error('  - Que SQL Server este corriendo');
    console.error('  - Que el usuario y password en .env sean correctos');
    console.error('  - Que el puerto 1433 este habilitado');
    process.exit(1);
  }
}

testConnection();
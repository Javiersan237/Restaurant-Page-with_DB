// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Script para actualizar el hash de la contrasena del admin.
// Uso: npm run update:admin-password
// =====================================================================

require('dotenv').config();
const bcrypt = require('bcrypt');
const { getPool, closePool, sql } = require('../src/config/database');

const ADMIN_EMAIL = 'admin@elysee.com';
const ADMIN_PASSWORD = 'Admin123!';
const BCRYPT_ROUNDS = 10;

async function updateAdminPassword() {
  console.log('');
  console.log('=== Actualizando contrasena del admin ===');
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log('');

  try {
    const pool = await getPool();

    // Generar hash de bcrypt
    console.log('Generando hash de bcrypt...');
    const hash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);
    console.log(`OK: Hash generado: ${hash.substring(0, 30)}...`);

    // Actualizar en la BD
    const result = await pool
      .request()
      .input('Email', sql.NVarChar(150), ADMIN_EMAIL)
      .input('PasswordHash', sql.NVarChar(255), hash)
      .query(`
        UPDATE dbo.Usuarios
        SET PasswordHash = @PasswordHash
        WHERE Email = @Email
      `);

    if (result.rowsAffected[0] === 0) {
      console.log('');
      console.log('ERROR: No se encontro el admin en la BD.');
      console.log('Ejecuta primero la migracion 0010_Insert_Admin_User.sql');
      await closePool();
      process.exit(1);
    }

    console.log('OK: Hash actualizado en la BD.');

    // Verificar que el hash es correcto
    console.log('');
    console.log('Verificando el hash...');
    const checkResult = await pool
      .request()
      .input('Email', sql.NVarChar(150), ADMIN_EMAIL)
      .query(`SELECT PasswordHash FROM dbo.Usuarios WHERE Email = @Email`);

    const storedHash = checkResult.recordset[0].PasswordHash;
    const valido = await bcrypt.compare(ADMIN_PASSWORD, storedHash);

    if (valido) {
      console.log('OK: El hash es valido.');
    } else {
      console.log('ERROR: El hash NO coincide.');
      await closePool();
      process.exit(1);
    }

    await closePool();
    console.log('');
    console.log('=====================================================================');
    console.log('  Admin actualizado correctamente.');
    console.log(`  Email    : ${ADMIN_EMAIL}`);
    console.log(`  Password : ${ADMIN_PASSWORD}`);
    console.log('=====================================================================');
    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('ERROR:', err.message);
    try {
      await closePool();
    } catch (_e) {
      /* ignorar */
    }
    process.exit(1);
  }
}

updateAdminPassword();
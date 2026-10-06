// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Servicio de autenticacion: registro, login, JWT.
// =====================================================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { getPool, sql } = require('../config/database');
const { JWT } = require('../config/env');

const BCRYPT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Genera un JWT para un usuario.
 * @param {Object} payload - { userID, email, role }
 * @returns {string}
 */
function generarToken(payload) {
  return jwt.sign(payload, JWT.secret, { expiresIn: JWT.expiresIn });
}

/**
 * Valida los datos de registro.
 */
function validarRegistro(data) {
  const errores = [];

  if (!data.nombre || data.nombre.trim().length === 0) {
    errores.push({ field: 'nombre', message: 'El nombre es requerido' });
  }
  if (!data.apellido || data.apellido.trim().length === 0) {
    errores.push({ field: 'apellido', message: 'El apellido es requerido' });
  }
  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errores.push({ field: 'email', message: 'Email invalido' });
  }
  if (!data.password || data.password.length < 6) {
    errores.push({ field: 'password', message: 'La contrasena debe tener al menos 6 caracteres' });
  }

  if (errores.length > 0) {
    const error = new Error('Errores de validacion');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = errores;
    throw error;
  }
}

/**
 * Registra un nuevo cliente.
 */
async function registrarCliente(data) {
  validarRegistro(data);

  const emailNormalizado = data.email.trim().toLowerCase();
  const pool = await getPool();

  // Verificar si el email ya existe
  const existente = await pool
    .request()
    .input('Email', sql.NVarChar(150), emailNormalizado)
    .query(`SELECT ClienteID FROM dbo.Clientes WHERE Email = @Email`);

  if (existente.recordset.length > 0) {
    const error = new Error('El email ya esta registrado');
    error.status = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // Hash de la contrasena
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  // Insertar cliente
  const result = await pool
    .request()
    .input('Nombre', sql.NVarChar(100), data.nombre.trim())
    .input('Apellido', sql.NVarChar(100), data.apellido.trim())
    .input('Email', sql.NVarChar(150), emailNormalizado)
    .input('Telefono', sql.NVarChar(20), data.telefono ? data.telefono.trim() : null)
    .input('PasswordHash', sql.NVarChar(255), passwordHash)
    .query(`
      INSERT INTO dbo.Clientes (Nombre, Apellido, Email, Telefono, PasswordHash, EsVIP, Activo)
      OUTPUT 
        INSERTED.ClienteID     AS clienteID,
        INSERTED.Nombre        AS nombre,
        INSERTED.Apellido      AS apellido,
        INSERTED.Email         AS email,
        INSERTED.Telefono      AS telefono,
        INSERTED.EsVIP         AS esVIP,
        INSERTED.Activo        AS activo
      VALUES (@Nombre, @Apellido, @Email, @Telefono, @PasswordHash, 0, 1)
    `);

  const cliente = result.recordset[0];

  // Generar JWT
  const token = generarToken({
    userID: cliente.clienteID,
    email: cliente.email,
    role: 'cliente',
  });

  return { token, user: cliente };
}

/**
 * Login de cliente.
 */
async function loginCliente(email, password) {
  if (!email || !password) {
    const error = new Error('Email y contrasena son requeridos');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const emailNormalizado = email.trim().toLowerCase();
  const pool = await getPool();

  const result = await pool
    .request()
    .input('Email', sql.NVarChar(150), emailNormalizado)
    .query(`
      SELECT 
        ClienteID     AS clienteID,
        Nombre        AS nombre,
        Apellido      AS apellido,
        Email         AS email,
        Telefono      AS telefono,
        PasswordHash  AS passwordHash,
        EsVIP         AS esVIP,
        Activo        AS activo
      FROM dbo.Clientes
      WHERE Email = @Email
    `);

  const cliente = result.recordset[0];

  if (!cliente) {
    const error = new Error('Credenciales invalidas');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (!cliente.activo) {
    const error = new Error('La cuenta esta desactivada');
    error.status = 403;
    error.code = 'ACCOUNT_DISABLED';
    throw error;
  }

  if (!cliente.passwordHash) {
    const error = new Error('Esta cuenta no tiene contrasena configurada');
    error.status = 401;
    error.code = 'NO_PASSWORD_SET';
    throw error;
  }

  const valido = await bcrypt.compare(password, cliente.passwordHash);

  if (!valido) {
    const error = new Error('Credenciales invalidas');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Actualizar UltimoLogin
  await pool
    .request()
    .input('ClienteID', sql.Int, cliente.clienteID)
    .query(`UPDATE dbo.Clientes SET UltimoLogin = GETDATE() WHERE ClienteID = @ClienteID`);

  // Generar token
  const token = generarToken({
    userID: cliente.clienteID,
    email: cliente.email,
    role: 'cliente',
  });

  // No devolver el hash
  delete cliente.passwordHash;

  return { token, user: cliente };
}

/**
 * Login de admin.
 */
async function loginAdmin(email, password) {
  if (!email || !password) {
    const error = new Error('Email y contrasena son requeridos');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const emailNormalizado = email.trim().toLowerCase();
  const pool = await getPool();

  const result = await pool
    .request()
    .input('Email', sql.NVarChar(150), emailNormalizado)
    .query(`
      SELECT 
        UsuarioID     AS usuarioID,
        Email         AS email,
        PasswordHash  AS passwordHash,
        Nombre        AS nombre,
        Rol           AS rol,
        Activo        AS activo
      FROM dbo.Usuarios
      WHERE Email = @Email
    `);

  const usuario = result.recordset[0];

  if (!usuario) {
    const error = new Error('Credenciales invalidas');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (!usuario.activo) {
    const error = new Error('La cuenta esta desactivada');
    error.status = 403;
    error.code = 'ACCOUNT_DISABLED';
    throw error;
  }

  const valido = await bcrypt.compare(password, usuario.passwordHash);

  if (!valido) {
    const error = new Error('Credenciales invalidas');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Actualizar UltimoLogin
  await pool
    .request()
    .input('UsuarioID', sql.Int, usuario.usuarioID)
    .query(`UPDATE dbo.Usuarios SET UltimoLogin = GETDATE() WHERE UsuarioID = @UsuarioID`);

  // Generar token
  const token = generarToken({
    userID: usuario.usuarioID,
    email: usuario.email,
    role: usuario.rol,
  });

  delete usuario.passwordHash;

  return { token, user: usuario };
}

/**
 * Obtiene el usuario actual segun el JWT.
 */
async function obtenerUsuarioActual(userID, role) {
  const pool = await getPool();

  if (role === 'cliente') {
    const result = await pool
      .request()
      .input('ClienteID', sql.Int, userID)
      .query(`
        SELECT 
          ClienteID     AS clienteID,
          Nombre        AS nombre,
          Apellido      AS apellido,
          Email         AS email,
          Telefono      AS telefono,
          Preferencias  AS preferencias,
          EsVIP         AS esVIP,
          Activo        AS activo,
          FechaRegistro AS fechaRegistro,
          UltimoLogin   AS ultimoLogin
        FROM dbo.Clientes
        WHERE ClienteID = @ClienteID
      `);

    const cliente = result.recordset[0];
    if (!cliente) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return { ...cliente, role: 'cliente' };
  }

  // Admin
  const result = await pool
    .request()
    .input('UsuarioID', sql.Int, userID)
    .query(`
      SELECT 
        UsuarioID     AS usuarioID,
        Email         AS email,
        Nombre        AS nombre,
        Rol           AS rol,
        Activo        AS activo,
        FechaCreacion AS fechaCreacion,
        UltimoLogin   AS ultimoLogin
      FROM dbo.Usuarios
      WHERE UsuarioID = @UsuarioID
    `);

  const usuario = result.recordset[0];
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return { ...usuario, role: usuario.rol };
}

module.exports = {
  registrarCliente,
  loginCliente,
  loginAdmin,
  obtenerUsuarioActual,
  generarToken,
};
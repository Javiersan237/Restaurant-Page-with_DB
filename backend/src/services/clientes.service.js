// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Servicio de Clientes: logica de negocio.
// =====================================================================

const clienteModel = require('../models/cliente.model');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida los datos de un cliente para creacion.
 * @param {Object} data
 */
function validarDatosCliente(data) {
  const errores = [];

  if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim().length === 0) {
    errores.push({ field: 'nombre', message: 'El nombre es requerido' });
  } else if (data.nombre.length > 100) {
    errores.push({ field: 'nombre', message: 'El nombre no puede exceder 100 caracteres' });
  }

  if (!data.apellido || typeof data.apellido !== 'string' || data.apellido.trim().length === 0) {
    errores.push({ field: 'apellido', message: 'El apellido es requerido' });
  } else if (data.apellido.length > 100) {
    errores.push({ field: 'apellido', message: 'El apellido no puede exceder 100 caracteres' });
  }

  if (!data.email || typeof data.email !== 'string') {
    errores.push({ field: 'email', message: 'El email es requerido' });
  } else if (!EMAIL_REGEX.test(data.email)) {
    errores.push({ field: 'email', message: 'El email no tiene un formato valido' });
  } else if (data.email.length > 150) {
    errores.push({ field: 'email', message: 'El email no puede exceder 150 caracteres' });
  }

  if (data.telefono && data.telefono.length > 20) {
    errores.push({ field: 'telefono', message: 'El telefono no puede exceder 20 caracteres' });
  }

  if (data.preferencias && data.preferencias.length > 500) {
    errores.push({ field: 'preferencias', message: 'Las preferencias no pueden exceder 500 caracteres' });
  }

  if (errores.length > 0) {
    const error = new Error('Errores de validacion en los datos del cliente');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = errores;
    throw error;
  }
}

/**
 * Crea un cliente o devuelve el existente si el email ya esta registrado.
 * Idempotente por email.
 *
 * @param {Object} data
 * @returns {Promise<{cliente: Object, created: boolean}>}
 */
async function crearObtener(data) {
  validarDatosCliente(data);

  const emailNormalizado = data.email.trim().toLowerCase();

  // Buscar si ya existe
  const existente = await clienteModel.findByEmail(emailNormalizado);

  if (existente) {
    return { cliente: existente, created: false };
  }

  // Crear nuevo
  const nuevo = await clienteModel.create({
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    email: emailNormalizado,
    telefono: data.telefono ? data.telefono.trim() : null,
    preferencias: data.preferencias ? data.preferencias.trim() : null,
    esVIP: data.esVIP === true,
  });

  return { cliente: nuevo, created: true };
}

/**
 * Obtiene un cliente por email.
 * @param {string} email
 * @returns {Promise<Object>}
 */
async function obtenerPorEmail(email) {
  if (!email || !EMAIL_REGEX.test(email)) {
    const error = new Error('Email invalido');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const cliente = await clienteModel.findByEmail(email.trim().toLowerCase());
  if (!cliente) {
    const error = new Error(`No se encontro un cliente con email ${email}`);
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return cliente;
}

/**
 * Obtiene un cliente por ID.
 * @param {number} clienteID
 * @returns {Promise<Object>}
 */
async function obtenerPorId(clienteID) {
  const id = parseInt(clienteID, 10);
  if (Number.isNaN(id) || id < 1) {
    const error = new Error('clienteID debe ser un numero positivo');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const cliente = await clienteModel.findById(id);
  if (!cliente) {
    const error = new Error(`No se encontro el cliente con ID ${id}`);
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return cliente;
}

module.exports = {
  crearObtener,
  obtenerPorEmail,
  obtenerPorId,
};
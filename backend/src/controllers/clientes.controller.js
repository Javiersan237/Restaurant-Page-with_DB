// =====================================================================
// ELYSEE RESERVAS - Backend
// =====================================================================
// Controlador de Clientes: manejo de HTTP request/response.
// =====================================================================

const clientesService = require('../services/clientes.service');

/**
 * POST /api/clientes
 * Crea un cliente o devuelve el existente si el email ya esta registrado.
 */
async function crear(req, res, next) {
  try {
    const resultado = await clientesService.crearObtener(req.body);

    const statusCode = resultado.created ? 201 : 200;

    res.status(statusCode).json({
      data: resultado.cliente,
      meta: {
        created: resultado.created,
        message: resultado.created
          ? 'Cliente creado exitosamente'
          : 'El cliente ya existia con este email',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/clientes/:email
 * Obtiene un cliente por email.
 */
async function obtenerPorEmail(req, res, next) {
  try {
    const cliente = await clientesService.obtenerPorEmail(req.params.email);

    res.json({
      data: cliente,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crear,
  obtenerPorEmail,
};
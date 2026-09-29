import api from './api'

/**
 * Servicio de Clientes.
 * Todos los endpoints relacionados con clientes del restaurante.
 */

/**
 * Crea un nuevo cliente.
 *
 * @param {Object} cliente
 * @param {string} cliente.nombre       - Nombre del cliente
 * @param {string} cliente.apellido     - Apellido del cliente
 * @param {string} cliente.email        - Email (único)
 * @param {string} [cliente.telefono]   - Teléfono (opcional)
 * @param {string} [cliente.preferencias] - Preferencias (opcional)
 * @returns {Promise<Object>} El cliente creado
 */
export async function crearCliente(cliente) {
  return api.post('/clientes', cliente)
}

/**
 * Busca un cliente por su email.
 *
 * @param {string} email
 * @returns {Promise<Object>} El cliente encontrado
 * @throws {Object} 404 si no existe
 */
export async function buscarClientePorEmail(email) {
  return api.get(`/clientes/${encodeURIComponent(email)}`)
}

export default {
  crearCliente,
  buscarClientePorEmail,
}

import api from './api'

/**
 * Servicio de Reservaciones.
 * Endpoints para crear, consultar y actualizar reservaciones.
 */

/**
 * Crea una nueva reservación.
 *
 * @param {Object} reservacion
 * @param {number} reservacion.clienteId       - ID del cliente
 * @param {number} reservacion.mesaId          - ID de la mesa
 * @param {string} reservacion.fecha           - Fecha YYYY-MM-DD
 * @param {string} reservacion.hora            - Hora HH:MM
 * @param {number} reservacion.numeroPersonas  - Número de personas
 * @param {string} [reservacion.notas]         - Notas adicionales
 * @returns {Promise<Object>} La reservación creada
 */
export async function crearReservacion(reservacion) {
  return api.post('/reservaciones', reservacion)
}

/**
 * Obtiene una reservación por su ID.
 *
 * @param {number|string} id
 * @returns {Promise<Object>} La reservación
 */
export async function obtenerReservacion(id) {
  return api.get(`/reservaciones/${id}`)
}

/**
 * Actualiza el estado de una reservación.
 *
 * @param {number|string} id
 * @param {string} estado  - Pendiente | Confirmada | Cancelada | Completada | NoShow
 * @returns {Promise<Object>} La reservación actualizada
 */
export async function actualizarEstadoReservacion(id, estado) {
  return api.patch(`/reservaciones/${id}/estado`, { estado })
}

export default {
  crearReservacion,
  obtenerReservacion,
  actualizarEstadoReservacion,
}

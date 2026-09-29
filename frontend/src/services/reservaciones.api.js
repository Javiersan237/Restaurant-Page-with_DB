import api from './api'

/**
 * Servicio de Reservaciones.
 * Endpoints para crear, consultar y actualizar reservaciones.
 */

/**
 * Crea una nueva reservación.
 *
 * @param {Object} reservacion
 * @param {number} reservacion.clienteID       - ID del cliente
 * @param {number} reservacion.mesaID          - ID de la mesa
 * @param {string} reservacion.fecha           - Fecha YYYY-MM-DD
 * @param {string} reservacion.horaInicio      - Hora HH:MM
 * @param {number} reservacion.duracionMin     - Duración en minutos (30-180)
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
 * @returns {Promise<Object>} La reservación con cliente, mesa y agenda
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

import api from './api'

/**
 * Servicio de Mesas.
 * Endpoints para listar mesas y consultar disponibilidad.
 */

/**
 * Lista todas las mesas del restaurante.
 *
 * @returns {Promise<Object>} { data: [...mesas], meta: { total } }
 */
export async function listarMesas() {
  return api.get('/mesas')
}

/**
 * Consulta las mesas disponibles para una fecha, hora y número de personas.
 *
 * @param {Object} params
 * @param {string} params.fecha          - Fecha en formato YYYY-MM-DD
 * @param {string} params.hora           - Hora en formato HH:MM
 * @param {number} params.personas       - Número de personas (1-20)
 * @returns {Promise<Object>} { data: [...mesasDisponibles] }
 */
export async function mesasDisponibles({ fecha, hora, personas }) {
  return api.get('/mesas/disponibles', {
    params: { fecha, hora, personas },
  })
}

export default {
  listarMesas,
  mesasDisponibles,
}

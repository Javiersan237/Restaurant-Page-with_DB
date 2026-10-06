import api from './api'

/**
 * Servicio de Mesas.
 * Endpoints para listar mesas y consultar disponibilidad.
 */

/**
 * Lista todas las mesas del restaurante.
 *
 * @param {Object} filtros - Opcionales:
 *   - ubicacion (string): "Terraza", "Salon Principal", etc.
 *   - capacidadMinima (int)
 *   - estado ("Disponible" | "Ocupada" | "Reservada" | "Mantenimiento")
 * @returns {Promise<Object>} { data: [...mesas], meta: { total } }
 */
export async function listarMesas(filtros = {}) {
  return api.get('/mesas', { params: filtros })
}

/**
 * Obtiene una mesa por ID.
 *
 * @param {number|string} id
 */
export async function obtenerMesa(id) {
  return api.get(`/mesas/${id}`)
}

/**
 * Consulta las mesas disponibles para una fecha, hora, duración y personas.
 *
 * @param {Object} params
 * @param {string} params.fecha          - Fecha en formato YYYY-MM-DD
 * @param {string} params.horaInicio     - Hora en formato HH:MM
 * @param {number} params.duracionMin    - Duración en minutos (30-180)
 * @param {number} params.personas       - Número de personas (1-20)
 * @returns {Promise<Object>} { data: [...mesasDisponibles] }
 */
export async function mesasDisponibles({ fecha, horaInicio, duracionMin, personas }) {
  return api.get('/mesas/disponibles', {
    params: { fecha, horaInicio, duracionMin, personas },
  })
}

export default {
  listarMesas,
  obtenerMesa,
  mesasDisponibles,
}

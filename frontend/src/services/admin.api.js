// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Servicios del panel de administrador.
// =====================================================================

import api from './api'

/**
 * Obtiene las estadisticas generales del sistema.
 */
export const obtenerStats = () => api.get('/admin/stats')

/**
 * Obtiene todas las reservaciones con filtros opcionales.
 * @param {Object} filtros - { estado?, fecha? }
 */
export const listarReservaciones = (filtros = {}) =>
  api.get('/admin/reservaciones', { params: filtros })

/**
 * Cambia el estado de una reservacion.
 */
export const cambiarEstadoReservacion = (id, estado) =>
  api.patch(`/admin/reservaciones/${id}/estado`, { estado })

/**
 * Obtiene la lista de todos los clientes.
 */
export const listarClientes = () => api.get('/admin/clientes')
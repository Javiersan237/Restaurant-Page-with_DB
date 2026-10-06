// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Servicios para el cliente logueado.
// =====================================================================

import api from './api'

/**
 * Obtiene las reservaciones del cliente logueado.
 */
export const misReservaciones = () => api.get('/cliente/reservaciones')

/**
 * Cancela una reservacion propia.
 */
export const cancelarReservacion = (id) =>
  api.patch(`/cliente/reservaciones/${id}/cancelar`)
// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Servicios de autenticacion.
// =====================================================================

import api from './api'

/**
 * Registra un nuevo cliente.
 */
export const registrar = (datos) => api.post('/auth/registro', datos)

/**
 * Login de cliente.
 */
export const login = (email, password) =>
  api.post('/auth/login', { email, password })

/**
 * Login de administrador.
 */
export const loginAdmin = (email, password) =>
  api.post('/auth/login-admin', { email, password })

/**
 * Obtiene los datos del usuario actual (requiere token).
 */
export const obtenerUsuarioActual = () => api.get('/auth/me')

/**
 * Cerrar sesion (el backend es stateless; borrar el token en el cliente).
 */
export const logout = () => api.post('/auth/logout')
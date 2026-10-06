import axios from 'axios'

/**
 * Instancia central de axios para todas las llamadas a la API de ÉLYSÉE.
 *
 * - baseURL: usa VITE_API_URL si existe (localhost:3000/api en dev)
 * - timeout: 10 segundos
 * - Interceptores para manejo global de errores
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ==========================================
// Interceptor de REQUEST
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ==========================================
// Interceptor de RESPONSE
// ==========================================
api.interceptors.response.use(
  // Respuesta exitosa: devolver solo `data`
  (response) => response.data,

  // Error: normalizar el formato
  (error) => {
    const normalized = {
      message: 'Error de conexión con el servidor',
      code: 'NETWORK_ERROR',
      status: null,
      details: [],
    }

    if (error.response) {
      const { status, data } = error.response
      normalized.status = status

      if (data?.error) {
        // Formato estándar de error de la API ÉLYSÉE
        normalized.message = data.error.message || normalized.message
        normalized.code = data.error.code || normalized.code
        normalized.details = data.error.details || []
      } else {
        normalized.message = data?.message || normalized.message
      }
    } else if (error.request) {
      normalized.message = 'No se pudo conectar con el servidor'
    }

    return Promise.reject(normalized)
  }
)

export default api

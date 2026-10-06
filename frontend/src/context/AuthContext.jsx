// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Contexto global de autenticacion.
// Maneja el estado del usuario logueado (cliente o admin).
// =====================================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authApi from '../services/auth.api'

const AuthContext = createContext(null)

/**
 * Provider que envuelve la app y expone el estado de autenticacion.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [cargando, setCargando] = useState(true)

  // Al montar el provider, si hay token guardado, cargar los datos del usuario
  useEffect(() => {
    async function cargarUsuario() {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setCargando(false)
        return
      }

      try {
        const res = await authApi.obtenerUsuarioActual()
        setUser(res.data)
      } catch (_err) {
        // Token invalido o expirado
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setCargando(false)
      }
    }

    cargarUsuario()
  }, [])

  /**
   * Guarda el token y los datos del usuario.
   */
  const guardarSesion = useCallback(({ token: nuevoToken, user: nuevoUser }) => {
    localStorage.setItem('token', nuevoToken)
    setToken(nuevoToken)
    setUser(nuevoUser)
  }, [])

  /**
   * Login de cliente.
   */
  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login(email, password)
      guardarSesion(res.data)
      return res.data
    },
    [guardarSesion]
  )

  /**
   * Login de administrador.
   */
  const loginAdmin = useCallback(
    async (email, password) => {
      const res = await authApi.loginAdmin(email, password)
      guardarSesion(res.data)
      return res.data
    },
    [guardarSesion]
  )

  /**
   * Registro de cliente nuevo.
   */
  const registrar = useCallback(
    async (datos) => {
      const res = await authApi.registrar(datos)
      guardarSesion(res.data)
      return res.data
    },
    [guardarSesion]
  )

  /**
   * Cerrar sesion.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  // Valores derivados
  const esCliente = user?.role === 'cliente' || (user?.clienteID && !user?.rol)
  const esAdmin = user?.role === 'admin' || user?.role === 'staff' || user?.rol === 'admin' || user?.rol === 'staff'
  const estaLogueado = !!user

  const value = {
    user,
    token,
    cargando,
    estaLogueado,
    esCliente,
    esAdmin,
    login,
    loginAdmin,
    registrar,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para consumir el contexto de autenticacion.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

export default AuthContext
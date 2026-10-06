// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Ruta protegida: redirige a /login si no hay sesion.
// =====================================================================

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Envuelve una ruta para requerir autenticacion.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.rolRequerido - 'cliente' | 'admin' (opcional)
 */
export default function ProtectedRoute({ children, rolRequerido }) {
  const { estaLogueado, esCliente, esAdmin, cargando } = useAuth()
  const location = useLocation()

  // Mientras carga la sesion, mostrar spinner
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-negro-900">
        <div className="text-dorado-400 font-serif text-xl tracking-widest">
          Cargando...
        </div>
      </div>
    )
  }

  // No logueado → redirigir a login
  if (!estaLogueado) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si requiere rol especifico
  if (rolRequerido === 'cliente' && !esCliente) {
    return <Navigate to="/admin" replace />
  }

  if (rolRequerido === 'admin' && !esAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
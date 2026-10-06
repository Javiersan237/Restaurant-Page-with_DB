// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Ruta protegida solo para administradores.
// Redirige a /admin/login si no hay sesion o no es admin.
// =====================================================================

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { estaLogueado, esAdmin, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-negro-900">
        <div className="text-dorado-400 font-serif text-xl tracking-widest">
          Cargando...
        </div>
      </div>
    )
  }

  if (!estaLogueado || !esAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
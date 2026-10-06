// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Pagina de login de administrador.
// =====================================================================

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import { useAuth } from '../context/AuthContext'

export default function AdminLoginPage() {
  const { loginAdmin, estaLogueado, esAdmin, cargando } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!cargando && estaLogueado && esAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [cargando, estaLogueado, esAdmin, navigate])

  const handleLogin = async (email, password) => {
    await loginAdmin(email, password)
    navigate('/admin', { replace: true })
  }

  return (
    <LoginForm
      onSubmit={handleLogin}
      titulo="Panel Administrativo"
      subtitulo="Acceso exclusivo para personal de ÉLYSÉE"
    />
  )
}
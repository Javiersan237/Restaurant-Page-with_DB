// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Pagina de login de cliente.
// =====================================================================

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, estaLogueado, esCliente, cargando } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Si ya esta logueado, redirigir
  useEffect(() => {
    if (!cargando && estaLogueado) {
      if (esCliente) {
        navigate('/mi-cuenta', { replace: true })
      } else {
        navigate('/admin', { replace: true })
      }
    }
  }, [cargando, estaLogueado, esCliente, navigate])

  const handleLogin = async (email, password) => {
    await login(email, password)
    const from = location.state?.from?.pathname || '/mi-cuenta'
    navigate(from, { replace: true })
  }

  return (
    <LoginForm
      onSubmit={handleLogin}
      titulo="Iniciar Sesión"
      subtitulo="Accede a tu cuenta de cliente"
      linkRegistro="/registro"
      textoLink="¿No tienes cuenta?"
    />
  )
}
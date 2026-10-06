// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Pagina de registro de cliente.
// =====================================================================

import { useNavigate } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { registrar } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (datos) => {
    await registrar(datos)
    navigate('/mi-cuenta', { replace: true })
  }

  return <RegisterForm onSubmit={handleRegister} />
}
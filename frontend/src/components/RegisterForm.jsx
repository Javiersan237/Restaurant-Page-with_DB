// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Formulario de registro de cliente.
// =====================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function RegisterForm({ onSubmit }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmarPassword: '',
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmarPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setCargando(true)

    try {
      await onSubmit({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono || undefined,
        password: form.password,
      })
    } catch (err) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setCargando(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 bg-negro-900 border border-dorado-400/30 rounded text-dorado-100 placeholder-dorado-100/30 focus:border-dorado-400 focus:outline-none transition-colors'
  const labelClass = 'block text-dorado-100 text-sm mb-2 tracking-wide'

  return (
    <div className="min-h-screen flex items-center justify-center bg-negro-900 px-4 py-20">
      <div className="w-full max-w-md bg-negro-800 border border-dorado-400/20 rounded-lg p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-dorado-400 tracking-widest mb-2">
            ÉLYSÉE
          </h1>
          <h2 className="font-serif text-xl text-dorado-100 tracking-wider">
            Crear Cuenta
          </h2>
          <p className="text-dorado-100/60 text-sm mt-2">
            Únete y gestiona tus reservaciones
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="nombre" className={labelClass}>Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Sofía"
              />
            </div>
            <div>
              <label htmlFor="apellido" className={labelClass}>Apellido</label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={form.apellido}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Márquez"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className={inputClass}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="telefono" className={labelClass}>Teléfono (opcional)</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={form.telefono}
              onChange={handleChange}
              className={inputClass}
              placeholder="+52 555 123 4567"
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label htmlFor="confirmarPassword" className={labelClass}>Confirmar contraseña</label>
            <input
              id="confirmarPassword"
              name="confirmarPassword"
              type="password"
              value={form.confirmarPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className={inputClass}
              placeholder="Repite tu contraseña"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-dorado-400 text-negro-900 font-serif tracking-widest uppercase text-sm rounded hover:bg-dorado-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-dorado-100/60 text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-dorado-400 hover:text-dorado-300 underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
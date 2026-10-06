// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Formulario de login reutilizable (cliente o admin).
// =====================================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * @param {Object} props
 * @param {Function} props.onSubmit - (email, password) => Promise
 * @param {string} props.titulo - Titulo del formulario
 * @param {string} props.subtitulo - Subtitulo
 * @param {string} props.linkRegistro - Ruta a registro (opcional)
 * @param {string} props.textoLink - Texto del link de registro (opcional)
 */
export default function LoginForm({
  onSubmit,
  titulo = 'Iniciar Sesión',
  subtitulo = 'Accede a tu cuenta',
  linkRegistro,
  textoLink,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      await onSubmit(email, password)
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-negro-900 px-4 py-20">
      <div className="w-full max-w-md bg-negro-800 border border-dorado-400/20 rounded-lg p-8 shadow-2xl">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-dorado-400 tracking-widest mb-2">
            ÉLYSÉE
          </h1>
          <h2 className="font-serif text-xl text-dorado-100 tracking-wider">
            {titulo}
          </h2>
          <p className="text-dorado-100/60 text-sm mt-2">{subtitulo}</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-dorado-100 text-sm mb-2 tracking-wide">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-negro-900 border border-dorado-400/30 rounded text-dorado-100 placeholder-dorado-100/30 focus:border-dorado-400 focus:outline-none transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-dorado-100 text-sm mb-2 tracking-wide">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-negro-900 border border-dorado-400/30 rounded text-dorado-100 placeholder-dorado-100/30 focus:border-dorado-400 focus:outline-none transition-colors"
              placeholder="••••••••"
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
            {cargando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link de registro */}
        {linkRegistro && (
          <p className="text-center text-dorado-100/60 text-sm mt-6">
            {textoLink || '¿No tienes cuenta?'}{' '}
            <Link to={linkRegistro} className="text-dorado-400 hover:text-dorado-300 underline">
              Regístrate
            </Link>
          </p>
        )}

        {/* Link de vuelta al inicio */}
        <p className="text-center text-dorado-100/40 text-xs mt-6">
          <Link to="/" className="hover:text-dorado-400">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { estaLogueado, esAdmin, esCliente, user, logout } = useAuth()
  const navigate = useNavigate()

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/menu', label: 'Menú' },
    { to: '/reservar', label: 'Reservar' },
  ]

  const linkClass = ({ isActive }) =>
    `font-serif tracking-widest uppercase text-sm transition-colors duration-300 ${
      isActive ? 'text-dorado-400' : 'text-dorado-100 hover:text-dorado-400'
    }`

  const handleLogout = () => {
    logout()
    setMenuAbierto(false)
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-negro-900/95 backdrop-blur-sm border-b border-dorado-400/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-serif text-2xl md:text-3xl text-dorado-400 tracking-widest">
          ÉLYSÉE
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}

          {/* Separador */}
          <div className="w-px h-5 bg-dorado-400/30" />

          {/* Estado de sesión */}
          {!estaLogueado && (
            <NavLink to="/login" className={linkClass}>
              Iniciar Sesión
            </NavLink>
          )}

          {estaLogueado && esCliente && (
            <>
              <NavLink to="/mi-cuenta" className={linkClass}>
                Mi Cuenta
              </NavLink>
              <button
                onClick={handleLogout}
                className="font-serif tracking-widest uppercase text-sm text-dorado-100 hover:text-red-400 transition-colors"
              >
                Salir
              </button>
            </>
          )}

          {estaLogueado && esAdmin && (
            <>
              <NavLink to="/admin" className={linkClass}>
                Panel Admin
              </NavLink>
              <button
                onClick={handleLogout}
                className="font-serif tracking-widest uppercase text-sm text-dorado-100 hover:text-red-400 transition-colors"
              >
                Salir
              </button>
            </>
          )}
        </div>

        {/* Botón menú móvil */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="md:hidden text-dorado-400 p-2"
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuAbierto ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="md:hidden bg-negro-800 border-t border-dorado-400/20 px-6 py-4">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                onClick={() => setMenuAbierto(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Separador */}
            <div className="h-px bg-dorado-400/20 my-2" />

            {/* Estado de sesión (movil) */}
            {!estaLogueado && (
              <NavLink
                to="/login"
                className={linkClass}
                onClick={() => setMenuAbierto(false)}
              >
                Iniciar Sesión
              </NavLink>
            )}

            {estaLogueado && esCliente && (
              <>
                <NavLink
                  to="/mi-cuenta"
                  className={linkClass}
                  onClick={() => setMenuAbierto(false)}
                >
                  Mi Cuenta
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-left font-serif tracking-widest uppercase text-sm text-dorado-100 hover:text-red-400"
                >
                  Cerrar Sesión
                </button>
              </>
            )}

            {estaLogueado && esAdmin && (
              <>
                <NavLink
                  to="/admin"
                  className={linkClass}
                  onClick={() => setMenuAbierto(false)}
                >
                  Panel Admin
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-left font-serif tracking-widest uppercase text-sm text-dorado-100 hover:text-red-400"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
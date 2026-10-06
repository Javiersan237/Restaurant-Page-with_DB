// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Panel del cliente logueado: muestra sus reservaciones.
// =====================================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as clienteApi from '../services/cliente.api'

export default function MiCuentaPage() {
  const { user, logout } = useAuth()
  const [reservaciones, setReservaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      try {
        const res = await clienteApi.misReservaciones()
        setReservaciones(res.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reservación?')) return

    try {
      await clienteApi.cancelarReservacion(id)
      // Actualizar la lista
      const res = await clienteApi.misReservaciones()
      setReservaciones(res.data)
    } catch (err) {
      alert(err.message)
    }
  }

  const colorEstado = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'text-yellow-400 border-yellow-400/40'
      case 'Confirmada': return 'text-green-400 border-green-400/40'
      case 'Cancelada': return 'text-red-400 border-red-400/40'
      case 'Completada': return 'text-blue-400 border-blue-400/40'
      case 'NoShow': return 'text-gray-400 border-gray-400/40'
      default: return 'text-dorado-100 border-dorado-100/40'
    }
  }

  return (
    <div className="min-h-screen bg-negro-900 px-4 py-24">
      <div className="max-w-5xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl text-dorado-400 tracking-widest mb-2">
              Mi Cuenta
            </h1>
            <p className="text-dorado-100/60">
              Bienvenido, {user?.nombre} {user?.apellido}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 border border-dorado-400/40 text-dorado-400 text-sm tracking-wider rounded hover:bg-dorado-400/10 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Botón nueva reservación */}
        <Link
          to="/reservar"
          className="inline-block mb-8 px-6 py-3 bg-dorado-400 text-negro-900 font-serif tracking-widest uppercase text-sm rounded hover:bg-dorado-300 transition-colors"
        >
          + Nueva Reservación
        </Link>

        {/* Estado de carga */}
        {cargando && (
          <p className="text-dorado-100/60 text-center py-10">Cargando reservaciones...</p>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Sin reservaciones */}
        {!cargando && reservaciones.length === 0 && (
          <div className="bg-negro-800 border border-dorado-400/20 rounded-lg p-10 text-center">
            <p className="text-dorado-100/60 mb-4">Aún no tienes reservaciones.</p>
            <Link to="/reservar" className="text-dorado-400 hover:text-dorado-300 underline">
              Haz tu primera reservación →
            </Link>
          </div>
        )}

        {/* Lista de reservaciones */}
        <div className="space-y-4">
          {reservaciones.map((r) => (
            <div
              key={r.reservacionID}
              className="bg-negro-800 border border-dorado-400/20 rounded-lg p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-dorado-100/60 text-xs uppercase tracking-wider mb-1">
                    Reservación #{r.reservacionID}
                  </p>
                  <p className="text-dorado-100 font-serif text-xl">
                    {r.agenda?.fecha} · {r.agenda?.horaInicio} - {r.agenda?.horaFin}
                  </p>
                </div>
                <span className={`px-3 py-1 border rounded text-xs tracking-wider uppercase ${colorEstado(r.estado)}`}>
                  {r.estado}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-dorado-100/80 mb-4">
                <div>
                  <p className="text-dorado-100/40 text-xs">Mesa</p>
                  <p>{r.mesa?.numeroMesa} ({r.mesa?.ubicacion})</p>
                </div>
                <div>
                  <p className="text-dorado-100/40 text-xs">Personas</p>
                  <p>{r.numeroPersonas}</p>
                </div>
                <div>
                  <p className="text-dorado-100/40 text-xs">Duración</p>
                  <p>{r.agenda?.duracionMin} min</p>
                </div>
                {r.notas && (
                  <div>
                    <p className="text-dorado-100/40 text-xs">Notas</p>
                    <p className="italic">{r.notas}</p>
                  </div>
                )}
              </div>

              {(r.estado === 'Pendiente' || r.estado === 'Confirmada') && (
                <button
                  onClick={() => handleCancelar(r.reservacionID)}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  Cancelar reservación
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
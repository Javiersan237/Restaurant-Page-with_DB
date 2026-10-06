// =====================================================================
// ELYSEE RESERVAS - Frontend
// =====================================================================
// Panel de administrador: reservaciones, clientes y estadisticas.
// =====================================================================

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import * as adminApi from '../services/admin.api'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [reservaciones, setReservaciones] = useState([])
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [tabActiva, setTabActiva] = useState('reservaciones')

  const cargarDatos = async () => {
    setCargando(true)
    setError(null)
    try {
      const [statsRes, reservacionesRes, clientesRes] = await Promise.all([
        adminApi.obtenerStats(),
        adminApi.listarReservaciones(filtroEstado ? { estado: filtroEstado } : {}),
        adminApi.listarClientes(),
      ])
      setStats(statsRes.data)
      setReservaciones(reservacionesRes.data)
      setClientes(clientesRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [filtroEstado])

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await adminApi.cambiarEstadoReservacion(id, nuevoEstado)
      cargarDatos()
    } catch (err) {
      alert(err.message)
    }
  }

  const colorEstado = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'text-yellow-400'
      case 'Confirmada': return 'text-green-400'
      case 'Cancelada': return 'text-red-400'
      case 'Completada': return 'text-blue-400'
      case 'NoShow': return 'text-gray-400'
      default: return 'text-dorado-100'
    }
  }

  return (
    <div className="min-h-screen bg-negro-900 px-4 py-24">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl text-dorado-400 tracking-widest mb-2">
              Panel Administrativo
            </h1>
            <p className="text-dorado-100/60">
              Bienvenido, {user?.nombre}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 border border-dorado-400/40 text-dorado-400 text-sm tracking-wider rounded hover:bg-dorado-400/10 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Clientes', value: stats.totalClientes },
              { label: 'Reservaciones', value: stats.totalReservaciones },
              { label: 'Pendientes', value: stats.pendientes },
              { label: 'Confirmadas', value: stats.confirmadas },
            ].map((s) => (
              <div key={s.label} className="bg-negro-800 border border-dorado-400/20 rounded-lg p-5">
                <p className="text-dorado-100/40 text-xs uppercase tracking-wider">{s.label}</p>
                <p className="text-dorado-400 text-3xl font-serif mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-dorado-400/20">
          {[
            { id: 'reservaciones', label: 'Reservaciones' },
            { id: 'clientes', label: 'Clientes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`pb-3 px-2 font-serif tracking-wider text-sm uppercase border-b-2 transition-colors ${
                tabActiva === tab.id
                  ? 'text-dorado-400 border-dorado-400'
                  : 'text-dorado-100/60 border-transparent hover:text-dorado-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Cargando */}
        {cargando && (
          <p className="text-dorado-100/60 text-center py-10">Cargando...</p>
        )}

        {/* Tabla Reservaciones */}
        {!cargando && tabActiva === 'reservaciones' && (
          <div className="bg-negro-800 border border-dorado-400/20 rounded-lg overflow-hidden">
            {/* Filtro */}
            <div className="p-4 border-b border-dorado-400/20 flex items-center gap-3">
              <label className="text-dorado-100/60 text-sm">Filtrar por estado:</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 bg-negro-900 border border-dorado-400/30 rounded text-dorado-100 focus:border-dorado-400 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Completada">Completada</option>
                <option value="NoShow">NoShow</option>
              </select>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-dorado-100">
                <thead className="bg-negro-900 text-dorado-100/60 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">Cliente</th>
                    <th className="text-left px-4 py-3">Mesa</th>
                    <th className="text-left px-4 py-3">Fecha / Hora</th>
                    <th className="text-left px-4 py-3">Personas</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-left px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservaciones.map((r) => (
                    <tr key={r.reservacionID} className="border-t border-dorado-400/10">
                      <td className="px-4 py-3">#{r.reservacionID}</td>
                      <td className="px-4 py-3">
                        {r.cliente?.nombre} {r.cliente?.apellido}
                        {r.cliente?.esVIP && <span className="ml-2 text-dorado-400 text-xs">VIP</span>}
                      </td>
                      <td className="px-4 py-3">
                        {r.mesa?.numeroMesa}
                        <span className="text-dorado-100/40 text-xs ml-1">({r.mesa?.ubicacion})</span>
                      </td>
                      <td className="px-4 py-3">
                        {r.agenda?.fecha}<br />
                        <span className="text-dorado-100/60 text-xs">
                          {r.agenda?.horaInicio} - {r.agenda?.horaFin}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.numeroPersonas}</td>
                      <td className={`px-4 py-3 ${colorEstado(r.estado)}`}>{r.estado}</td>
                      <td className="px-4 py-3">
                        <select
                          value={r.estado}
                          onChange={(e) => handleCambiarEstado(r.reservacionID, e.target.value)}
                          className="px-2 py-1 bg-negro-900 border border-dorado-400/30 rounded text-xs text-dorado-100"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmada">Confirmada</option>
                          <option value="Cancelada">Cancelada</option>
                          <option value="Completada">Completada</option>
                          <option value="NoShow">NoShow</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {reservaciones.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-dorado-100/40">
                        No hay reservaciones con ese filtro
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabla Clientes */}
        {!cargando && tabActiva === 'clientes' && (
          <div className="bg-negro-800 border border-dorado-400/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-dorado-100">
                <thead className="bg-negro-900 text-dorado-100/60 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">Nombre</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Teléfono</th>
                    <th className="text-left px-4 py-3">VIP</th>
                    <th className="text-left px-4 py-3">Registro</th>
                    <th className="text-left px-4 py-3">Último Login</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.clienteID} className="border-t border-dorado-400/10">
                      <td className="px-4 py-3">#{c.clienteID}</td>
                      <td className="px-4 py-3">{c.nombre} {c.apellido}</td>
                      <td className="px-4 py-3 text-dorado-100/60">{c.email}</td>
                      <td className="px-4 py-3 text-dorado-100/60">{c.telefono || '—'}</td>
                      <td className="px-4 py-3">
                        {c.esVIP ? <span className="text-dorado-400">Sí</span> : <span className="text-dorado-100/40">No</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-dorado-100/60">
                        {c.fechaRegistro ? new Date(c.fechaRegistro).toLocaleDateString('es-MX') : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-dorado-100/60">
                        {c.ultimoLogin ? new Date(c.ultimoLogin).toLocaleString('es-MX') : 'Nunca'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
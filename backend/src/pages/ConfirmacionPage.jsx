import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerReservacion } from '../services/reservaciones.api'

export default function ConfirmacionPage() {
  const { id } = useParams()
  const [reservacion, setReservacion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const data = await obtenerReservacion(id)
        if (activo) setReservacion(data?.data || data)
      } catch (err) {
        if (activo) setError(err?.message || 'No se encontró la reservación')
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()
    return () => {
      activo = false
    }
  }, [id])

  // ==========================================
  // Extraer campos (con soporte para anidados)
  // ==========================================
  const r = reservacion || {}
  const cliente = r.cliente || {}
  const mesa = r.mesa || {}
  const agenda = r.agenda || {}

  const idReserva = r.reservacionID ?? r.ReservacionID ?? id
  const numeroPersonas = r.numeroPersonas ?? r.NumeroPersonas
  const estado = r.estado ?? r.Estado ?? 'Pendiente'
  const notas = r.notas ?? r.Notas

  // Fecha/hora vienen dentro de `agenda`
  const fecha = agenda.fecha ?? r.fecha ?? r.Fecha
  const horaInicio = agenda.horaInicio ?? r.horaInicio ?? r.HoraInicio
  const horaFin = agenda.horaFin ?? r.horaFin ?? r.HoraFin
  const duracionMin = agenda.duracionMin ?? r.duracionMin ?? r.DuracionMin

  // Cliente
  const nombreCliente = cliente.nombre
    ? `${cliente.nombre} ${cliente.apellido || ''}`.trim()
    : null
  const emailCliente = cliente.email ?? null

  // Mesa
  const mesaNumero = mesa.numeroMesa ?? r.numeroMesa
  const mesaUbicacion = mesa.ubicacion ?? r.ubicacion

  // ==========================================
  // Estados de carga / error
  // ==========================================
  if (cargando) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-dorado-300 font-serif italic">
          Cargando tu reservación...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-red-400 text-lg mb-6">{error}</p>
          <Link
            to="/reservar"
            className="inline-block bg-vino-500 hover:bg-vino-600 text-dorado-100 font-serif px-8 py-3 rounded transition-colors duration-300 tracking-widest uppercase text-sm"
          >
            Intentar de nuevo
          </Link>
        </div>
      </div>
    )
  }

  // ==========================================
  // Vista
  // ==========================================
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* Ícono de éxito */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-dorado-400 flex items-center justify-center mx-auto mb-6">
          <span className="text-dorado-400 text-5xl">✓</span>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl text-dorado-400 mb-4">
          ¡Reservación confirmada!
        </h1>
        <div className="w-16 h-px bg-dorado-400 mx-auto mb-6"></div>
        <p className="text-negro-200 font-serif italic">
          Te esperamos en ÉLYSÉE. Guarda tu código de reservación.
        </p>
      </div>

      {/* Detalles */}
      <div className="bg-negro-800 border border-dorado-400/30 rounded-lg p-8 space-y-4">
        <div className="flex justify-between border-b border-dorado-400/20 pb-3">
          <span className="text-dorado-300 font-serif">Código</span>
          <span className="text-dorado-100 font-mono">#{idReserva}</span>
        </div>

        {fecha && (
          <div className="flex justify-between border-b border-dorado-400/20 pb-3">
            <span className="text-dorado-300 font-serif">Fecha</span>
            <span className="text-dorado-100">{fecha}</span>
          </div>
        )}

        {horaInicio && (
          <div className="flex justify-between border-b border-dorado-400/20 pb-3">
            <span className="text-dorado-300 font-serif">Horario</span>
            <span className="text-dorado-100">
              {horaInicio}
              {horaFin ? ` – ${horaFin}` : ''}
            </span>
          </div>
        )}

        {duracionMin && (
          <div className="flex justify-between border-b border-dorado-400/20 pb-3">
            <span className="text-dorado-300 font-serif">Duración</span>
            <span className="text-dorado-100">{duracionMin} min</span>
          </div>
        )}

        {numeroPersonas && (
          <div className="flex justify-between border-b border-dorado-400/20 pb-3">
            <span className="text-dorado-300 font-serif">Personas</span>
            <span className="text-dorado-100">{numeroPersonas}</span>
          </div>
        )}

        {mesaNumero && (
          <div className="flex justify-between border-b border-dorado-400/20 pb-3">
            <span className="text-dorado-300 font-serif">Mesa</span>
            <span className="text-dorado-100">
              {mesaNumero}
              {mesaUbicacion ? ` · ${mesaUbicacion}` : ''}
            </span>
          </div>
        )}

        {nombreCliente && (
          <div className="flex justify-between border-b border-dorado-400/20 pb-3">
            <span className="text-dorado-300 font-serif">A nombre de</span>
            <span className="text-dorado-100">{nombreCliente}</span>
          </div>
        )}

        {emailCliente && (
          <div className="flex justify-between border-b border-dorado-400/20 pb-3">
            <span className="text-dorado-300 font-serif">Email</span>
            <span className="text-dorado-100 text-sm">{emailCliente}</span>
          </div>
        )}

        {notas && (
          <div className="flex justify-between border-b border-dorado-400/20 pb-3">
            <span className="text-dorado-300 font-serif">Notas</span>
            <span className="text-dorado-100 text-sm text-right max-w-[60%]">
              {notas}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-dorado-300 font-serif">Estado</span>
          <span className="text-dorado-100">{estado}</span>
        </div>
      </div>

      {/* Botones */}
      <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
        <Link
          to="/"
          className="inline-block bg-vino-500 hover:bg-vino-600 text-dorado-100 font-serif px-8 py-3 rounded transition-colors duration-300 tracking-widest uppercase text-sm border border-dorado-400/30 hover:border-dorado-400 text-center"
        >
          Volver al inicio
        </Link>
        <Link
          to="/reservar"
          className="inline-block bg-transparent border border-dorado-400/40 hover:border-dorado-400 text-dorado-100 font-serif px-8 py-3 rounded transition-colors duration-300 tracking-widest uppercase text-sm text-center"
        >
          Hacer otra reservación
        </Link>
      </div>
    </div>
  )
}
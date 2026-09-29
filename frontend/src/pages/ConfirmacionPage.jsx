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
  // Vista de confirmación
  // ==========================================
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      {/* Ícono de éxito */}
      <div className="w-24 h-24 rounded-full border-2 border-dorado-400 flex items-center justify-center mx-auto mb-8">
        <span className="text-dorado-400 text-5xl">✓</span>
      </div>

      <h1 className="font-serif text-4xl md:text-5xl text-dorado-400 mb-4">
        ¡Reservación confirmada!
      </h1>
      <div className="w-16 h-px bg-dorado-400 mx-auto mb-8"></div>
      <p className="text-negro-200 font-serif italic mb-12">
        Te esperamos en ÉLYSÉE. Recibirás un correo con los detalles.
      </p>

      {/* Detalles de la reservación */}
      <div className="bg-negro-800 border border-dorado-400/30 rounded-lg p-8 text-left space-y-4">
        <div className="flex justify-between border-b border-dorado-400/20 pb-3">
          <span className="text-dorado-300 font-serif">Código</span>
          <span className="text-dorado-100 font-mono">
            #{reservacion?.ReservacionID || reservacion?.reservacionId || id}
          </span>
        </div>

        <div className="flex justify-between border-b border-dorado-400/20 pb-3">
          <span className="text-dorado-300 font-serif">Fecha</span>
          <span className="text-dorado-100">
            {reservacion?.Fecha || reservacion?.fecha}
          </span>
        </div>

        <div className="flex justify-between border-b border-dorado-400/20 pb-3">
          <span className="text-dorado-300 font-serif">Hora</span>
          <span className="text-dorado-100">
            {reservacion?.Hora || reservacion?.hora}
          </span>
        </div>

        <div className="flex justify-between border-b border-dorado-400/20 pb-3">
          <span className="text-dorado-300 font-serif">Personas</span>
          <span className="text-dorado-100">
            {reservacion?.NumeroPersonas || reservacion?.numeroPersonas}
          </span>
        </div>

        {reservacion?.MesaID && (
          <div className="flex justify-between border-b border-dorado-400/20 pb-3">
            <span className="text-dorado-300 font-serif">Mesa</span>
            <span className="text-dorado-100">
              {reservacion?.NumeroMesa || `ID ${reservacion.MesaID}`}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-dorado-300 font-serif">Estado</span>
          <span className="text-dorado-100">
            {reservacion?.Estado || reservacion?.estado || 'Pendiente'}
          </span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
        <Link
          to="/"
          className="inline-block bg-vino-500 hover:bg-vino-600 text-dorado-100 font-serif px-8 py-3 rounded transition-colors duration-300 tracking-widest uppercase text-sm border border-dorado-400/30 hover:border-dorado-400"
        >
          Volver al inicio
        </Link>
        <Link
          to="/reservar"
          className="inline-block bg-transparent border border-dorado-400/40 hover:border-dorado-400 text-dorado-100 font-serif px-8 py-3 rounded transition-colors duration-300 tracking-widest uppercase text-sm"
        >
          Hacer otra reservación
        </Link>
      </div>
    </div>
  )
}

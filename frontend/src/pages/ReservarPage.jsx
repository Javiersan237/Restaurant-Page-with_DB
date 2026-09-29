import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReservaForm from '../components/ReservaForm'
import MesaCard from '../components/MesaCard'
import { useDisponibilidad } from '../hooks/useDisponibilidad'
import { buscarClientePorEmail, crearCliente } from '../services/clientes.api'
import { crearReservacion } from '../services/reservaciones.api'

const PASO_FORM = 'form'
const PASO_MESA = 'mesa'

export default function ReservarPage() {
  const navigate = useNavigate()

  const [paso, setPaso] = useState(PASO_FORM)
  const [datosForm, setDatosForm] = useState(null)
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const { mesas, cargando: cargandoMesas, error: errorMesas, consultar } =
    useDisponibilidad()

  const manejarDatosForm = async (data) => {
    setDatosForm(data)
    setError(null)
    setCargando(true)

    await consultar({
      fecha: data.reservacion.fecha,
      horaInicio: data.reservacion.horaInicio,
      duracionMin: data.reservacion.duracionMin,
      personas: data.reservacion.numeroPersonas,
    })

    setCargando(false)
    setPaso(PASO_MESA)
  }

  const manejarConfirmarReserva = async () => {
    if (!mesaSeleccionada || !datosForm) return

    setCargando(true)
    setError(null)

    try {
      const { cliente, reservacion } = datosForm

      // 1) Buscar o crear cliente
      let clienteID
      try {
        const existente = await buscarClientePorEmail(cliente.email)
        clienteID = existente?.data?.clienteID || existente?.data?.ClienteID
      } catch (err) {
        if (err.status === 404) {
          const nuevo = await crearCliente(cliente)
          clienteID = nuevo?.data?.clienteID || nuevo?.data?.ClienteID
        } else {
          throw err
        }
      }

      // 2) Crear la reservación
      const nuevaReservacion = await crearReservacion({
        clienteID,
        mesaID: mesaSeleccionada.mesaID || mesaSeleccionada.MesaID,
        fecha: reservacion.fecha,
        horaInicio: reservacion.horaInicio,
        duracionMin: reservacion.duracionMin,
        numeroPersonas: reservacion.numeroPersonas,
        notas: reservacion.notas,
      })

      const idReservacion =
        nuevaReservacion?.data?.reservacionID ||
        nuevaReservacion?.data?.ReservacionID ||
        nuevaReservacion?.data?.id

      navigate(`/confirmacion/${idReservacion}`)
    } catch (err) {
      setError(err?.message || 'No se pudo completar la reservación')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="font-serif text-5xl md:text-6xl text-dorado-400 mb-4">
          Reservar Mesa
        </h1>
        <div className="w-16 h-px bg-dorado-400 mx-auto mb-6"></div>
        <p className="text-negro-200 font-serif italic">
          {paso === PASO_FORM && 'Completa tus datos para comenzar'}
          {paso === PASO_MESA && 'Selecciona la mesa perfecta para ti'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-12">
        <div className={`flex items-center gap-2 ${paso === PASO_FORM ? 'text-dorado-400' : 'text-negro-400'}`}>
          <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm ${paso === PASO_FORM ? 'border-dorado-400 bg-dorado-400/20' : 'border-negro-400'}`}>1</span>
          <span className="font-serif text-sm tracking-wider">Datos</span>
        </div>
        <div className="w-12 h-px bg-negro-500"></div>
        <div className={`flex items-center gap-2 ${paso === PASO_MESA ? 'text-dorado-400' : 'text-negro-400'}`}>
          <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm ${paso === PASO_MESA ? 'border-dorado-400 bg-dorado-400/20' : 'border-negro-400'}`}>2</span>
          <span className="font-serif text-sm tracking-wider">Mesa</span>
        </div>
      </div>

      <div className="bg-negro-800/50 border border-dorado-400/20 rounded-lg p-8">
        {paso === PASO_FORM && (
          <ReservaForm onSiguiente={manejarDatosForm} cargando={cargando} errorExterno={error} />
        )}

        {paso === PASO_MESA && (
          <div className="space-y-6">
            <div className="bg-negro-800 border border-dorado-400/20 rounded p-4 text-sm text-negro-100">
              <p><span className="text-dorado-300">Fecha:</span> {datosForm?.reservacion.fecha}</p>
              <p><span className="text-dorado-300">Hora:</span> {datosForm?.reservacion.horaInicio}</p>
              <p><span className="text-dorado-300">Duración:</span> {datosForm?.reservacion.duracionMin} min</p>
              <p><span className="text-dorado-300">Personas:</span> {datosForm?.reservacion.numeroPersonas}</p>
            </div>

            {cargandoMesas && (
              <p className="text-dorado-300 text-center py-8">Buscando mesas disponibles...</p>
            )}

            {errorMesas && !cargandoMesas && (
              <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded text-sm text-center">
                {errorMesas.message || 'No se pudieron cargar las mesas'}
              </div>
            )}

            {!cargandoMesas && !errorMesas && mesas.length === 0 && (
              <p className="text-negro-200 text-center py-8 font-serif italic">
                No hay mesas disponibles para esa fecha y hora. Intenta con otro horario.
              </p>
            )}

            {!cargandoMesas && mesas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mesas.map((mesa) => (
                  <MesaCard key={mesa.mesaID || mesa.MesaID} mesa={mesa}
                    seleccionada={mesaSeleccionada?.mesaID === mesa.mesaID}
                    onClick={setMesaSeleccionada} />
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => { setPaso(PASO_FORM); setMesaSeleccionada(null); setError(null) }}
                disabled={cargando}
                className="flex-1 bg-negro-700 hover:bg-negro-600 text-dorado-100 font-serif px-6 py-4 rounded transition-all duration-300 tracking-widest uppercase text-sm">
                Atrás
              </button>
              <button type="button" onClick={manejarConfirmarReserva}
                disabled={!mesaSeleccionada || cargando}
                className="flex-1 bg-vino-500 hover:bg-vino-600 disabled:bg-negro-700 disabled:cursor-not-allowed text-dorado-100 font-serif px-6 py-4 rounded transition-all duration-300 tracking-widest uppercase text-sm border border-dorado-400/30 hover:border-dorado-400">
                {cargando ? 'Confirmando...' : 'Confirmar reservación'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

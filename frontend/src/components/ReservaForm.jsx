import { useForm, validadores } from '../hooks/useForm'

/**
 * Formulario de reservación de ÉLYSÉE.
 *
 * @param {Function} onSiguiente - Callback que se ejecuta cuando el form es válido.
 *                                 Recibe { cliente, reservacion } como argumento.
 * @param {boolean} cargando     - Si el padre está procesando la petición.
 * @param {string} errorExterno  - Error que viene del backend.
 */
export default function ReservaForm({ onSiguiente, cargando = false, errorExterno = null }) {
  const { valores, errores, manejarCambio, manejarBlur, validar } = useForm(
    {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      fecha: '',
      hora: '',
      personas: 2,
      notas: '',
    },
    {
      nombre: validadores.requerido('El nombre es obligatorio'),
      apellido: validadores.requerido('El apellido es obligatorio'),
      email: validadores.email,
      telefono: validadores.telefono,
      fecha: validadores.fechaFutura,
      hora: validadores.requerido('La hora es obligatoria'),
      personas: validadores.numeroPositivo(1, 20),
    }
  )

  const manejarSubmit = (e) => {
    e.preventDefault()
    if (!validar()) return

    // Separar en cliente y reservación
    onSiguiente?.({
      cliente: {
        nombre: valores.nombre.trim(),
        apellido: valores.apellido.trim(),
        email: valores.email.trim().toLowerCase(),
        telefono: valores.telefono.trim() || null,
      },
      reservacion: {
        fecha: valores.fecha,
        hora: valores.hora,
        numeroPersonas: Number(valores.personas),
        notas: valores.notas.trim() || null,
      },
    })
  }

  const inputClass = (campo) =>
    `w-full bg-negro-800 border ${
      errores[campo] ? 'border-red-500' : 'border-dorado-400/30'
    } rounded px-4 py-3 text-dorado-100 placeholder-negro-400 focus:outline-none focus:border-dorado-400 transition-colors`

  const labelClass = 'block text-dorado-300 font-serif text-sm mb-2 tracking-wider'

  // Generar opciones de hora (13:00 a 22:00 cada 30 min)
  const opcionesHora = []
  for (let h = 13; h <= 22; h++) {
    opcionesHora.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 22) opcionesHora.push(`${String(h).padStart(2, '0')}:30`)
  }

  // Fecha mínima: mañana
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const fechaMinima = manana.toISOString().split('T')[0]

  return (
    <form onSubmit={manejarSubmit} className="space-y-6">
      {/* =============================
          DATOS DEL CLIENTE
          ============================= */}
      <div>
        <h3 className="font-serif text-2xl text-dorado-400 mb-4 tracking-widest">
          Tus datos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className={labelClass}>
              Nombre *
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={valores.nombre}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              placeholder="Sofía"
              className={inputClass('nombre')}
              disabled={cargando}
            />
            {errores.nombre && (
              <p className="text-red-400 text-xs mt-1">{errores.nombre}</p>
            )}
          </div>

          <div>
            <label htmlFor="apellido" className={labelClass}>
              Apellido *
            </label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              value={valores.apellido}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              placeholder="García"
              className={inputClass('apellido')}
              disabled={cargando}
            />
            {errores.apellido && (
              <p className="text-red-400 text-xs mt-1">{errores.apellido}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={valores.email}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              placeholder="sofia@ejemplo.com"
              className={inputClass('email')}
              disabled={cargando}
            />
            {errores.email && (
              <p className="text-red-400 text-xs mt-1">{errores.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="telefono" className={labelClass}>
              Teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={valores.telefono}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              placeholder="+52 55 1234 5678"
              className={inputClass('telefono')}
              disabled={cargando}
            />
            {errores.telefono && (
              <p className="text-red-400 text-xs mt-1">{errores.telefono}</p>
            )}
          </div>
        </div>
      </div>

      {/* =============================
          DATOS DE LA RESERVACIÓN
          ============================= */}
      <div>
        <h3 className="font-serif text-2xl text-dorado-400 mb-4 tracking-widest">
          Tu reservación
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="fecha" className={labelClass}>
              Fecha *
            </label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              min={fechaMinima}
              value={valores.fecha}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              className={inputClass('fecha')}
              disabled={cargando}
            />
            {errores.fecha && (
              <p className="text-red-400 text-xs mt-1">{errores.fecha}</p>
            )}
          </div>

          <div>
            <label htmlFor="hora" className={labelClass}>
              Hora *
            </label>
            <select
              id="hora"
              name="hora"
              value={valores.hora}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              className={inputClass('hora')}
              disabled={cargando}
            >
              <option value="">Selecciona...</option>
              {opcionesHora.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            {errores.hora && (
              <p className="text-red-400 text-xs mt-1">{errores.hora}</p>
            )}
          </div>

          <div>
            <label htmlFor="personas" className={labelClass}>
              Personas *
            </label>
            <input
              id="personas"
              name="personas"
              type="number"
              min="1"
              max="20"
              value={valores.personas}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              className={inputClass('personas')}
              disabled={cargando}
            />
            {errores.personas && (
              <p className="text-red-400 text-xs mt-1">{errores.personas}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="notas" className={labelClass}>
            Notas especiales (alergias, ocasión, etc.)
          </label>
          <textarea
            id="notas"
            name="notas"
            rows="3"
            value={valores.notas}
            onChange={manejarCambio}
            placeholder="Cumpleaños, alergias, preferencias..."
            className={inputClass('notas')}
            disabled={cargando}
          />
        </div>
      </div>

      {/* =============================
          ERROR DEL BACKEND
          ============================= */}
      {errorExterno && (
        <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded text-sm">
          {errorExterno}
        </div>
      )}

      {/* =============================
          BOTÓN ENVIAR
          ============================= */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-vino-500 hover:bg-vino-600 disabled:bg-negro-700 disabled:cursor-not-allowed text-dorado-100 font-serif px-8 py-4 rounded transition-all duration-300 tracking-widest uppercase text-sm border border-dorado-400/30 hover:border-dorado-400"
        >
          {cargando ? 'Buscando disponibilidad...' : 'Continuar'}
        </button>
      </div>
    </form>
  )
}

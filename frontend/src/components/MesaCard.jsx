/**
 * Tarjeta visual para mostrar una mesa.
 *
 * @param {Object} mesa         - Datos de la mesa (MesaID, NumeroMesa, Capacidad, Ubicacion)
 * @param {boolean} seleccionada - Si esta mesa está seleccionada
 * @param {Function} onClick     - Callback al hacer clic
 */
export default function MesaCard({ mesa, seleccionada = false, onClick }) {
  const { MesaID, NumeroMesa, Capacidad, Ubicacion } = mesa

  return (
    <button
      type="button"
      onClick={() => onClick?.(mesa)}
      className={`w-full text-left p-6 rounded border transition-all duration-300 ${
        seleccionada
          ? 'bg-vino-500/20 border-dorado-400 shadow-lg shadow-dorado-400/20'
          : 'bg-negro-800 border-dorado-400/20 hover:border-dorado-400/60'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-serif text-2xl text-dorado-400">
          Mesa {NumeroMesa}
        </h4>
        {seleccionada && (
          <span className="text-dorado-400 text-xl" aria-label="Seleccionada">
            ✓
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-negro-100">
        <p className="flex items-center gap-2">
          <span className="text-dorado-400">👥</span>
          <span>Capacidad: {Capacidad} personas</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="text-dorado-400">📍</span>
          <span>{Ubicacion}</span>
        </p>
      </div>
    </button>
  )
}

/**
 * Tarjeta visual para mostrar una mesa.
 *
 * @param {Object} mesa         - Datos de la mesa (mesaID, numeroMesa, capacidad, ubicacion)
 * @param {boolean} seleccionada - Si esta mesa está seleccionada
 * @param {Function} onClick     - Callback al hacer clic
 */
export default function MesaCard({ mesa, seleccionada = false, onClick }) {
  // Compatibilidad con camelCase (backend) y PascalCase (por si acaso)
  const id = mesa.mesaID ?? mesa.MesaID
  const numero = mesa.numeroMesa ?? mesa.NumeroMesa
  const capacidad = mesa.capacidad ?? mesa.Capacidad
  const ubicacion = mesa.ubicacion ?? mesa.Ubicacion

  return (
    <button
      type="button"
      onClick={() => onClick?.({ ...mesa, mesaID: id })}
      className={`w-full text-left p-6 rounded border transition-all duration-300 ${
        seleccionada
          ? 'bg-vino-500/20 border-dorado-400 shadow-lg shadow-dorado-400/20'
          : 'bg-negro-800 border-dorado-400/20 hover:border-dorado-400/60'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-serif text-2xl text-dorado-400">
          Mesa {numero}
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
          <span>Capacidad: {capacidad} personas</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="text-dorado-400">📍</span>
          <span>{ubicacion}</span>
        </p>
      </div>
    </button>
  )
}

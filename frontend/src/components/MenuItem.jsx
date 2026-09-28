/**
 * Tarjeta de un platillo del menú.
 *
 * @param {Object} platillo - { nombre, descripcion, precio, precioTexto? }
 */
export default function MenuItem({ platillo }) {
  const { nombre, descripcion, precio, precioTexto } = platillo

  const precioFinal =
    precioTexto || (precio > 0 ? `$${precio.toLocaleString('es-MX')}` : '—')

  return (
    <div className="group flex items-start justify-between gap-6 py-6 border-b border-dorado-400/10 last:border-b-0 transition-colors duration-300 hover:bg-dorado-400/5 px-4 rounded">
      <div className="flex-1">
        <h4 className="font-serif text-xl text-dorado-300 mb-1 group-hover:text-dorado-400 transition-colors">
          {nombre}
        </h4>
        <p className="text-negro-200 text-sm leading-relaxed">{descripcion}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="font-serif text-dorado-400 text-lg">{precioFinal}</span>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { menu } from '../data/menuData'
import MenuItem from '../components/MenuItem'

export default function MenuPage() {
  const [categoriaActiva, setCategoriaActiva] = useState(menu[0].id)

  const categoriaActual = menu.find((c) => c.id === categoriaActiva) || menu[0]

  return (
    <div className="bg-negro-900 min-h-screen">
      {/* ==========================================
          HERO DEL MENÚ
          ========================================== */}
      <section className="py-20 px-6 text-center">
        <p className="font-serif italic text-dorado-300 text-lg mb-3 tracking-widest">
          Nuestra Carta
        </p>
        <h1 className="font-serif text-5xl md:text-7xl text-dorado-400 mb-6">
          Menú
        </h1>
        <div className="w-24 h-px bg-dorado-400 mx-auto mb-8"></div>
        <p className="text-negro-200 max-w-2xl mx-auto font-serif italic">
          Una selección curada de platillos que celebran la tradición francesa
          con ingredientes de temporada.
        </p>
      </section>

      {/* ==========================================
          NAVEGACIÓN DE CATEGORÍAS
          ========================================== */}
      <section className="sticky top-16 z-30 bg-negro-900/95 backdrop-blur-sm border-y border-dorado-400/10 py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-2 md:gap-4">
          {menu.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`font-serif tracking-widest uppercase text-xs md:text-sm px-4 py-2 rounded transition-all duration-300 ${
                categoriaActiva === cat.id
                  ? 'bg-dorado-400 text-negro-900'
                  : 'text-dorado-100 hover:text-dorado-400'
              }`}
            >
              {cat.categoria}
            </button>
          ))}
        </div>
      </section>

      {/* ==========================================
          LISTA DE PLATILLOS
          ========================================== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Encabezado de categoría */}
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl text-dorado-400 mb-3">
              {categoriaActual.categoria}
            </h2>
            {categoriaActual.descripcion && (
              <p className="text-negro-300 font-serif italic">
                {categoriaActual.descripcion}
              </p>
            )}
          </div>

          {/* Platillos */}
          <div className="bg-negro-800/40 rounded-lg border border-dorado-400/10 px-4 md:px-8 py-4">
            {categoriaActual.platillos.map((platillo) => (
              <MenuItem key={platillo.id} platillo={platillo} />
            ))}
          </div>

          {/* Nota */}
          <p className="text-center text-negro-400 text-xs mt-8 italic">
            * Los precios están en pesos mexicanos (MXN) e incluyen impuestos.
            <br />
            Consulta a tu mesero por alergias o restricciones alimentarias.
          </p>
        </div>
      </section>

      {/* ==========================================
          CTA
          ========================================== */}
      <section className="py-20 px-6 bg-negro-800 border-t border-dorado-400/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-dorado-400 mb-4">
            ¿Listo para probar?
          </h2>
          <p className="text-negro-200 mb-8 font-serif italic">
            Reserva tu mesa y déjanos sorprenderte
          </p>
          <a
            href="/reservar"
            className="inline-block bg-vino-500 hover:bg-vino-600 text-dorado-100 font-serif px-10 py-4 rounded transition-all duration-300 tracking-widest uppercase text-sm border border-dorado-400/30 hover:border-dorado-400"
          >
            Reservar Mesa
          </a>
        </div>
      </section>
    </div>
  )
}

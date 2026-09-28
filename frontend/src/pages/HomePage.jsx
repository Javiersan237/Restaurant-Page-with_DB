import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="bg-negro-900">
      {/* ==========================================
          SECCIÓN HERO
          ========================================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80')",
          }}
        >
          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-negro-900/75"></div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 text-center max-w-3xl px-6">
          <p className="font-serif italic text-dorado-300 text-lg md:text-xl mb-4 tracking-widest">
            Desde 1985 · Alta Cocina Francesa
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-dorado-400 mb-6 leading-tight">
            ÉLYSÉE
          </h1>
          <div className="w-24 h-px bg-dorado-400 mx-auto mb-8"></div>
          <p className="text-dorado-100 text-lg md:text-2xl mb-10 font-serif italic">
            Una experiencia culinaria que celebra lo mejor de la gastronomía francesa
          </p>
          <Link
            to="/reservar"
            className="inline-block bg-vino-500 hover:bg-vino-600 text-dorado-100 font-serif px-10 py-4 rounded transition-all duration-300 tracking-widest uppercase text-sm border border-dorado-400/30 hover:border-dorado-400"
          >
            Reservar Mesa
          </Link>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN SOBRE NOSOTROS
          ========================================== */}
      <section className="py-24 px-6 bg-negro-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-dorado-400 mb-8">
            Nuestra Filosofía
          </h2>
          <div className="w-16 h-px bg-dorado-400 mx-auto mb-10"></div>
          <p className="text-negro-100 text-lg leading-relaxed mb-6">
            En <span className="text-dorado-400 font-serif">ÉLYSÉE</span> creemos que una
            comida no es solo un acto de nutrición, sino un ritual que se celebra con los
            sentidos. Cada platillo es una obra de arte elaborada con ingredientes
            seleccionados de la más alta calidad.
          </p>
          <p className="text-negro-200 text-lg leading-relaxed italic font-serif">
            "La cocina es el arte más bello, porque se aprecia con todos los sentidos."
          </p>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN GALERÍA
          ========================================== */}
      <section className="py-24 px-6 bg-negro-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-dorado-400 mb-4 text-center">
            Galería
          </h2>
          <div className="w-16 h-px bg-dorado-400 mx-auto mb-16"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'photo-1550966871-3ed3cdb5ed0c',
              'photo-1517248135467-4c7edcad34c4',
              'photo-1555396273-367ea4eb4db5',
              'photo-1424847651672-bf20a4b0982b',
              'photo-1466978913421-dad2ebd01d17',
              'photo-1600891964092-4316c288032e',
            ].map((id, i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded group cursor-pointer"
              >
                <img
                  src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`}
                  alt={`Platillo ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN CONTACTO CON MAPA
          ========================================== */}
      <section className="py-24 px-6 bg-negro-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-dorado-400 mb-4 text-center">
            Visítanos
          </h2>
          <div className="w-16 h-px bg-dorado-400 mx-auto mb-16"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Info de contacto */}
            <div>
              <h3 className="font-serif text-2xl text-dorado-300 mb-6 tracking-widest">
                ÉLYSÉE · Alta Cocina Francesa
              </h3>
              <ul className="space-y-4 text-negro-100">
                <li className="flex items-start gap-3">
                  <span className="text-dorado-400 text-xl">📍</span>
                  <div>
                    <p className="font-serif text-dorado-200 mb-1">Dirección</p>
                    <p>Av. Reforma 123, Col. Juárez</p>
                    <p>Ciudad de México, CDMX 06600</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-dorado-400 text-xl">📞</span>
                  <div>
                    <p className="font-serif text-dorado-200 mb-1">Teléfono</p>
                    <p>+52 (55) 1234 5678</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-dorado-400 text-xl">✉️</span>
                  <div>
                    <p className="font-serif text-dorado-200 mb-1">Email</p>
                    <p>contacto@elysee.mx</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Mapa */}
            <div className="w-full h-[400px] rounded overflow-hidden border border-dorado-400/30">
              <iframe
                title="Ubicación ÉLYSÉE"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.6648892821557!2d-99.16869!3d19.42844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI1JzQyLjQiTiA5OcKwMTAnMDcuMyJX!5e0!3m2!1ses!2smx!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN CTA FINAL
          ========================================== */}
      <section className="py-24 px-6 bg-vino-800 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl text-dorado-300 mb-6">
            Vive la experiencia ÉLYSÉE
          </h2>
          <p className="text-dorado-100 text-lg mb-10 font-serif italic">
            Reserva tu mesa y déjate sorprender por nuestra cocina
          </p>
          <Link
            to="/reservar"
            className="inline-block bg-dorado-400 hover:bg-dorado-500 text-negro-900 font-serif px-10 py-4 rounded transition-all duration-300 tracking-widest uppercase text-sm font-semibold"
          >
            Reservar Mesa
          </Link>
        </div>
      </section>
    </div>
  )
}

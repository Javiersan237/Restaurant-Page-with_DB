export default function Footer() {
  return (
    <footer className="bg-negro-900 border-t border-dorado-400/20 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Contacto */}
        <div>
          <h3 className="font-serif text-dorado-400 text-xl mb-4 tracking-widest">
            CONTACTO
          </h3>
          <ul className="space-y-2 text-negro-200 text-sm">
            <li>📍 Av. Reforma 123, Ciudad de México</li>
            <li>📞 +52 (55) 1234 5678</li>
            <li>✉️ contacto@elysee.mx</li>
          </ul>
        </div>

        {/* Horarios */}
        <div>
          <h3 className="font-serif text-dorado-400 text-xl mb-4 tracking-widest">
            HORARIOS
          </h3>
          <ul className="space-y-2 text-negro-200 text-sm">
            <li>Lunes a Viernes · 13:00 – 23:00</li>
            <li>Sábados · 13:00 – 00:00</li>
            <li>Domingos · 13:00 – 22:00</li>
          </ul>
        </div>

        {/* Redes sociales */}
        <div>
          <h3 className="font-serif text-dorado-400 text-xl mb-4 tracking-widest">
            SÍGUENOS
          </h3>
          <div className="flex gap-4">
            <a href="#" className="text-dorado-100 hover:text-dorado-400 transition-colors text-sm">
              Instagram
            </a>
            <a href="#" className="text-dorado-100 hover:text-dorado-400 transition-colors text-sm">
              Facebook
            </a>
            <a href="#" className="text-dorado-100 hover:text-dorado-400 transition-colors text-sm">
              TikTok
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-dorado-400/10 text-center">
        <p className="text-negro-300 text-xs font-serif italic">
          © {new Date().getFullYear()} ÉLYSÉE · Alta Cocina Francesa. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

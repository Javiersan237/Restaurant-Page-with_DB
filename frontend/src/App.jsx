function App() {
  return (
    <div className="min-h-screen bg-negro-900 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="font-serif text-6xl md:text-8xl text-dorado-400 mb-4">
          ÉLYSÉE
        </h1>
        <p className="font-serif text-xl md:text-2xl text-dorado-200 italic mb-8">
          Alta Cocina Francesa
        </p>
        <div className="w-24 h-px bg-dorado-400 mx-auto mb-8"></div>
        <p className="text-negro-200 mb-8">
          Sistema de Reservas — Tailwind v4 funcionando correctamente ✅
        </p>
        <button className="bg-vino-500 hover:bg-vino-600 text-dorado-100 font-serif px-8 py-3 rounded transition-colors duration-300">
          Reservar Mesa
        </button>
      </div>
    </div>
  )
}

export default App

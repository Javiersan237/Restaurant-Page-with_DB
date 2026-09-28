import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <h1 className="font-serif text-7xl md:text-9xl text-dorado-400 mb-6">
          404
        </h1>
        <p className="text-negro-200 text-lg mb-8 font-serif italic">
          Esta página no existe en nuestro menú.
        </p>
        <Link
          to="/"
          className="inline-block bg-vino-500 hover:bg-vino-600 text-dorado-100 font-serif px-8 py-3 rounded transition-colors duration-300 tracking-widest uppercase text-sm"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

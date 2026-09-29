import { useEffect, useRef, useState } from 'react'

/**
 * Hook que detecta cuando un elemento entra al viewport.
 *
 * - Usa IntersectionObserver si está disponible.
 * - Si no está, asume visible desde el inicio (fallback).
 */
export function useScrollReveal(options = {}) {
  const { threshold = 0.15, once = true } = options

  // Si IntersectionObserver no existe (SSR o navegadores viejos),
  // asumimos visible desde el principio.
  const soportaObserver =
    typeof window !== 'undefined' &&
    typeof window.IntersectionObserver !== 'undefined'

  const ref = useRef(null)
  const [visible, setVisible] = useState(!soportaObserver)

  useEffect(() => {
    // Si no hay soporte para IntersectionObserver, ya está visible
    if (!soportaObserver) return

    const elemento = ref.current
    if (!elemento) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(entry.target)
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold }
    )

    observer.observe(elemento)
    return () => observer.disconnect()
  }, [threshold, once, soportaObserver])

  return { ref, visible }
}

export default useScrollReveal
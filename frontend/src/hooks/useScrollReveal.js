import { useEffect, useRef, useState } from 'react'

export function useScrollReveal(options = {}) {
  const { threshold = 0.15, once = true } = options
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

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
  }, [threshold, once])

  return { ref, visible }
}

export default useScrollReveal

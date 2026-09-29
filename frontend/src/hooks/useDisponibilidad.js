import { useState, useEffect, useCallback } from 'react'
import { mesasDisponibles } from '../services/mesas.api'

/**
 * Hook personalizado para consultar disponibilidad de mesas.
 *
 * Uso:
 *   const { mesas, cargando, error, consultar } = useDisponibilidad()
 *   consultar({ fecha: '2026-10-01', horaInicio: '20:00', duracionMin: 120, personas: 4 })
 *
 * @returns {Object} { mesas, cargando, error, consultar }
 */
export function useDisponibilidad() {
  const [mesas, setMesas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const consultar = useCallback(async ({ fecha, horaInicio, duracionMin, personas }) => {
    if (!fecha || !horaInicio || !duracionMin || !personas) {
      setMesas([])
      return
    }

    setCargando(true)
    setError(null)

    try {
      const respuesta = await mesasDisponibles({ fecha, horaInicio, duracionMin, personas })
      setMesas(respuesta?.data || [])
    } catch (err) {
      setError(err)
      setMesas([])
    } finally {
      setCargando(false)
    }
  }, [])

  // Limpiar mesas al desmontar
  useEffect(() => {
    return () => {
      setMesas([])
      setError(null)
    }
  }, [])

  return { mesas, cargando, error, consultar }
}

export default useDisponibilidad

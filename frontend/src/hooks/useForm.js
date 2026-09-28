import { useState } from 'react'

/**
 * Hook personalizado para manejar formularios con validación.
 *
 * Uso:
 *   const { valores, errores, manejarCambio, validar, resetear } = useForm(
 *     { email: '', password: '' },
 *     {
 *       email: (v) => !v ? 'Requerido' : (v.includes('@') ? '' : 'Email inválido'),
 *       password: (v) => v.length < 6 ? 'Mínimo 6 caracteres' : '',
 *     }
 *   )
 *
 * @param {Object} valoresIniciales
 * @param {Object} validaciones - Funciones que retornan string de error (vacío = válido)
 * @returns {Object} Estado y helpers del formulario
 */
export function useForm(valoresIniciales = {}, validaciones = {}) {
  const [valores, setValores] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})
  const [tocado, setTocado] = useState({})

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target
    const nuevoValor = type === 'checkbox' ? checked : value

    setValores((prev) => ({ ...prev, [name]: nuevoValor }))

    // Validación en vivo si el campo ya fue tocado
    if (tocado[name] && validaciones[name]) {
      const error = validaciones[name](nuevoValor, { ...valores, [name]: nuevoValor })
      setErrores((prev) => ({ ...prev, [name]: error }))
    }
  }

  const manejarBlur = (e) => {
    const { name, value } = e.target
    setTocado((prev) => ({ ...prev, [name]: true }))

    if (validaciones[name]) {
      const error = validaciones[name](value, valores)
      setErrores((prev) => ({ ...prev, [name]: error }))
    }
  }

  const validar = () => {
    const nuevosErrores = {}
    let valido = true

    for (const campo in validaciones) {
      const error = validaciones[campo](valores[campo], valores)
      if (error) {
        nuevosErrores[campo] = error
        valido = false
      }
    }

    setErrores(nuevosErrores)
    setTocado(
      Object.keys(validaciones).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    )
    return valido
  }

  const resetear = (nuevosValores = valoresIniciales) => {
    setValores(nuevosValores)
    setErrores({})
    setTocado({})
  }

  return {
    valores,
    errores,
    tocado,
    manejarCambio,
    manejarBlur,
    validar,
    resetear,
    setValores,
  }
}

// ==========================================
// Validadores reutilizables
// ==========================================

export const validadores = {
  requerido: (msg = 'Este campo es obligatorio') => (v) =>
    !v || (typeof v === 'string' && !v.trim()) ? msg : '',

  email: (v) => {
    if (!v) return 'El email es obligatorio'
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(v) ? '' : 'Email inválido'
  },

  telefono: (v) => {
    if (!v) return '' // opcional
    const regex = /^[0-9+\s()-]{7,20}$/
    return regex.test(v) ? '' : 'Teléfono inválido'
  },

  fechaFutura: (v) => {
    if (!v) return 'La fecha es obligatoria'
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fecha = new Date(v + 'T00:00:00')
    return fecha >= hoy ? '' : 'La fecha debe ser futura'
  },

  numeroPositivo: (min = 1, max = 20) => (v) => {
    const n = Number(v)
    if (!v && v !== 0) return 'Este campo es obligatorio'
    if (isNaN(n)) return 'Debe ser un número'
    if (n < min || n > max) return `Debe estar entre ${min} y ${max}`
    return ''
  },

  longitudMin: (min) => (v) =>
    v && v.length >= min ? '' : `Mínimo ${min} caracteres`,
}

export default useForm

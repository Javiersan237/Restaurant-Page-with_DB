import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Reveal({ children, delay = 0, className = '' }) {
  const { ref, visible } = useScrollReveal()

  const delayClass = delay ? `delay-${delay}` : ''

  return (
    <div
      ref={ref}
      className={`${visible ? `animate-fade-in-up ${delayClass}` : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { useInView } from '@/shared/lib/useInView'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  once?: boolean
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Scroll-triggered fade-up, matching the reveal used across kubanlab.ru:
// opacity 0 -> 1, translateY(40px) -> 0, "opacity .9s ease, transform .9s ease".
export function Reveal({ children, delay = 0, y = 40, once = true }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once })

  if (prefersReducedMotion) {
    return <Box ref={ref}>{children}</Box>
  }

  return (
    <Box
      ref={ref}
      sx={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : `translateY(${y}px)`,
        transition: 'opacity .9s ease, transform .9s ease',
        transitionDelay: inView ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </Box>
  )
}

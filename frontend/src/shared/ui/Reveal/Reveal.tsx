import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { useAppReadyStore } from '@/shared/lib/appReadyStore'
import { useInView } from '@/shared/lib/useInView'

interface RevealProps {
  children: ReactNode
  delay?: number
  once?: boolean
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Pure opacity fade — no movement, no scale. Slow and understated on purpose.
// Gated on both scroll-into-view AND the splash having finished — an element
// already in the viewport behind the splash must not fire early.
export function Reveal({ children, delay = 0, once = true }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once })
  const appReady = useAppReadyStore((s) => s.ready)
  const show = inView && appReady

  if (prefersReducedMotion) {
    return <Box ref={ref}>{children}</Box>
  }

  return (
    <Box
      ref={ref}
      sx={{
        opacity: show ? 1 : 0,
        transition: 'opacity 1s ease',
        transitionDelay: show ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </Box>
  )
}

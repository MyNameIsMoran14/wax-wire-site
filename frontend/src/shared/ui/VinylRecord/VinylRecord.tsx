import { Box } from '@mui/material'
import { type PointerEvent as ReactPointerEvent, useEffect, useRef } from 'react'
import { useScratchSound } from '@/shared/lib/useScratchSound'

interface VinylRecordProps {
  size?: number
  spinning?: boolean
  /** Grab-and-scratch with the cursor, plus a synthesized scratch sound. */
  interactive?: boolean
}

const GROOVES = [1, 2, 3, 4, 5]
const DEG_PER_MS = 360 / 6000 // matches the old 6s/revolution CSS animation

const angleAt = (clientX: number, clientY: number, rect: DOMRect) => {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI
}

// Shortest signed difference between two angles, handling the 360deg wrap.
const angleDelta = (from: number, to: number) => {
  let d = (to - from) % 360
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

// Perfectly concentric circles have full rotational symmetry, so a plain
// disc never visibly "spins" no matter the animation — the eye needs an
// off-center detail to track. The gloss wedge and seam line below are that
// anchor; everything else stays symmetric.
//
// Rotation is driven entirely from JS (rAF), not a CSS @keyframes loop, so
// grabbing the record mid-spin and letting go never causes a visual jump —
// there's a single source of truth for the current angle at all times.
export function VinylRecord({ size = 380, spinning = true, interactive = false }: VinylRecordProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const rotationRef = useRef(0)
  const draggingRef = useRef(false)
  const lastPointerAngleRef = useRef(0)
  const lastFrameRef = useRef<number | null>(null)
  const scratch = useScratchSound()

  useEffect(() => {
    let rafId: number
    const tick = (t: number) => {
      rafId = requestAnimationFrame(tick)
      const last = lastFrameRef.current
      lastFrameRef.current = t
      if (last === null) return
      const dt = t - last
      if (!draggingRef.current && spinning) {
        rotationRef.current += DEG_PER_MS * dt
      }
      const el = svgRef.current
      if (el) el.style.transform = `rotate(${rotationRef.current}deg)`
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [spinning])

  const handlePointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive) return
    const el = svgRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    draggingRef.current = true
    lastPointerAngleRef.current = angleAt(e.clientX, e.clientY, el.getBoundingClientRect())
    scratch.start()
  }

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive || !draggingRef.current) return
    const el = svgRef.current
    if (!el) return
    const now = performance.now()
    const angle = angleAt(e.clientX, e.clientY, el.getBoundingClientRect())
    const delta = angleDelta(lastPointerAngleRef.current, angle)
    const dt = Math.max(1, now - (lastFrameRef.current ?? now))
    rotationRef.current += delta
    el.style.transform = `rotate(${rotationRef.current}deg)`
    scratch.update(Math.abs(delta) / (dt / 1000))
    lastPointerAngleRef.current = angle
  }

  const endDrag = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive) return
    draggingRef.current = false
    scratch.stop()
    svgRef.current?.releasePointerCapture(e.pointerId)
  }

  return (
    <Box
      ref={svgRef}
      component="svg"
      viewBox="0 0 420 420"
      role="img"
      aria-label="Вращающаяся виниловая пластинка"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      sx={{
        width: size,
        height: size,
        display: 'block',
        touchAction: interactive ? 'none' : undefined,
        userSelect: 'none',
        cursor: interactive ? 'grab' : undefined,
        '&:active': interactive ? { cursor: 'grabbing' } : undefined,
      }}
    >
      <defs>
        <linearGradient id="vinyl-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx={210} cy={210} r={210} fill="#151210" />
      {GROOVES.map((i) => (
        <circle key={i} cx={210} cy={210} r={210 - i * 26} fill="none" stroke="#2c2825" strokeWidth={1} />
      ))}

      {/* Glossy highlight sweep — breaks symmetry, sells the spin, looks premium */}
      <circle cx={210} cy={210} r={210} fill="url(#vinyl-gloss)" />

      {/* Groove-in seam — a faint radial scratch, gives the eye a fixed point to track */}
      <line x1={210} y1={135} x2={210} y2={18} stroke="#3a3532" strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />

      <circle cx={210} cy={210} r={75} fill="#8C2F27" />
      {/* Label tick — small asymmetric mark, doubles as a spindle-hole reference */}
      <line x1={210} y1={210} x2={210} y2={148} stroke="#F7F3EC" strokeWidth={2} strokeLinecap="round" opacity={0.55} />
      <circle cx={210} cy={210} r={8} fill="#F7F3EC" />
    </Box>
  )
}

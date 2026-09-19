import { keyframes } from '@emotion/react'
import { Box } from '@mui/material'

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

interface VinylRecordProps {
  size?: number
  spinning?: boolean
}

const GROOVES = [1, 2, 3, 4, 5]

// Perfectly concentric circles have full rotational symmetry, so a plain
// disc never visibly "spins" no matter the animation — the eye needs an
// off-center detail to track. The gloss wedge and seam line below are that
// anchor; everything else stays symmetric.
export function VinylRecord({ size = 380, spinning = true }: VinylRecordProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 420 420"
      role="img"
      aria-label="Вращающаяся виниловая пластинка"
      sx={{
        width: size,
        height: size,
        display: 'block',
        animation: spinning ? `${spin} 6s linear infinite` : 'none',
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

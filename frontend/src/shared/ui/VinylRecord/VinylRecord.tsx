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
      <circle cx={210} cy={210} r={210} fill="#151210" />
      {GROOVES.map((i) => (
        <circle key={i} cx={210} cy={210} r={210 - i * 26} fill="none" stroke="#2c2825" strokeWidth={1} />
      ))}
      <circle cx={210} cy={210} r={75} fill="#8C2F27" />
      <circle cx={210} cy={210} r={8} fill="#F7F3EC" />
    </Box>
  )
}

import { keyframes } from '@emotion/react'
import { Box, Typography } from '@mui/material'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import { GradientBlinds } from '@/shared/ui/GradientBlinds'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

// Shared shell for /login and /register: the WebGL background panel is
// mounted once here and stays alive across navigation between the two —
// nesting them under one layout route (instead of each page owning its
// own copy) avoids destroying/recreating the canvas on every redirect,
// which was causing a visible jump/reset.
export function AuthLayout() {
  const location = useLocation()

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, minHeight: '100vh' }}>
      <Box
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'flex-end',
          p: 6,
          height: '100%',
          overflow: 'hidden',
          bgcolor: '#120f0c',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <GradientBlinds
            gradientColors={['#120f0c', '#8C2F27', '#d99a5b']}
            angle={15}
            noise={0.15}
            blindCount={20}
            blindMinWidth={40}
            spotlightRadius={1}
            spotlightSoftness={1.1}
            spotlightOpacity={0.85}
            mouseDampening={0.15}
            shineDirection="left"
            mixBlendMode="lighten"
          />
        </Box>
        <Typography
          component={RouterLink}
          to="/"
          variant="h3"
          sx={{
            position: 'relative',
            zIndex: 1,
            color: '#F7F3EC',
            fontWeight: 900,
            textDecoration: 'none',
            transition: 'color 550ms cubic-bezier(0.22, 1, 0.36, 1)',
            '&:hover': { color: '#8C2F27' },
          }}
        >
          WAX & WIRE.
        </Typography>
      </Box>
      <Box key={location.pathname} sx={{ height: '100%', animation: `${fadeIn} 380ms cubic-bezier(0.22, 1, 0.36, 1)` }}>
        <Outlet />
      </Box>
    </Box>
  )
}

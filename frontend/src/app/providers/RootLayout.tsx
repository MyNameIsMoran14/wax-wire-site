import { keyframes } from '@emotion/react'
import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

// Groups routes so navigating WITHIN a section (e.g. login <-> register)
// doesn't retrigger the section-level transition — only crossing INTO a
// different section does. Keeps the auth pages' own persistent background
// (see widgets/AuthLayout) untouched while still giving every other
// redirect on the site the same smooth entrance.
function routeGroup(pathname: string): string {
  if (pathname === '/login' || pathname === '/register') return 'auth'
  if (pathname.startsWith('/catalog')) return 'catalog'
  return 'home'
}

// One consistent transition for every top-level redirect on the site —
// previously the first load (splash) looked polished but a plain client-side
// redirect (e.g. Home -> Login) just popped in with nothing.
export function RootLayout() {
  const location = useLocation()

  return (
    <Box key={routeGroup(location.pathname)} sx={{ animation: `${fadeIn} 380ms cubic-bezier(0.22, 1, 0.36, 1)` }}>
      <Outlet />
    </Box>
  )
}

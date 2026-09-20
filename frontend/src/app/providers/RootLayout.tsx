import { keyframes } from '@emotion/react'
import { Box } from '@mui/material'
import { useLayoutEffect } from 'react'
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

  // React Router doesn't reset scroll on navigation (it's an SPA, not a real
  // page load) — without this, opening a product from partway down the
  // catalog grid lands on the new page already scrolled to that offset.
  // Keyed on pathname only, not the full location, so filter changes that
  // just update the query string (same page) don't yank the scroll around.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <Box key={routeGroup(location.pathname)} sx={{ animation: `${fadeIn} 600ms cubic-bezier(0.22, 1, 0.36, 1)` }}>
      <Outlet />
    </Box>
  )
}

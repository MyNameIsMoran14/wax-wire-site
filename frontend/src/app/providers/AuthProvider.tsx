import { Box, CircularProgress } from '@mui/material'
import { type ReactNode, useEffect } from 'react'
import type { User } from '@/entities/user'
import { useAuthStore } from '@/entities/user'
import { httpClient } from '@/shared/api/httpClient'
import { setUnauthorizedHandler, tokenStorage } from '@/shared/api/tokenStorage'

// On mount, tries to restore a session from the httpOnly refresh cookie
// (access tokens only ever live in memory, so a reload always starts here).
export function AuthProvider({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const setChecking = useAuthStore((s) => s.setChecking)
  const setGuest = useAuthStore((s) => s.setGuest)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    setUnauthorizedHandler(clearAuth)
    return () => setUnauthorizedHandler(null)
  }, [clearAuth])

  useEffect(() => {
    let cancelled = false
    setChecking()
    httpClient
      .get<{ user: User }>('/auth/me')
      .then((data) => {
        if (!cancelled) setAuth(data.user, tokenStorage.get() ?? '')
      })
      .catch(() => {
        if (!cancelled) setGuest()
      })
    return () => {
      cancelled = true
    }
    // Runs once on mount to bootstrap the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'idle' || status === 'checking') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}

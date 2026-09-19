import { Box } from '@mui/material'
import { type ReactNode, useEffect, useState } from 'react'
import type { User } from '@/entities/user'
import { useAuthStore } from '@/entities/user'
import { httpClient } from '@/shared/api/httpClient'
import { setUnauthorizedHandler, tokenStorage } from '@/shared/api/tokenStorage'
import { useAppReadyStore } from '@/shared/lib/appReadyStore'
import { SplashScreen } from '@/shared/ui/SplashScreen'

const MIN_SPLASH_MS = 900

// On mount, tries to restore a session from the httpOnly refresh cookie
// (access tokens only ever live in memory, so a reload always starts here).
// A spinning-record splash covers this check and stays up for a minimum
// duration so it doesn't just flicker when the check resolves instantly.
// `appReadyStore` flips the moment the splash starts exiting, so the page's
// own fade-in runs concurrently with the splash's fade-out — one smooth
// cross-dissolve, no dead gap in between.
export function AuthProvider({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const setChecking = useAuthStore((s) => s.setChecking)
  const setGuest = useAuthStore((s) => s.setGuest)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const setAppReady = useAppReadyStore((s) => s.setReady)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  useEffect(() => {
    setUnauthorizedHandler(clearAuth)
    return () => setUnauthorizedHandler(null)
  }, [clearAuth])

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS)
    return () => clearTimeout(timer)
  }, [])

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

  const authChecked = status === 'authenticated' || status === 'guest'
  const splashDone = authChecked && minTimeElapsed

  useEffect(() => {
    if (splashDone) setAppReady()
  }, [splashDone, setAppReady])

  return (
    <>
      <SplashScreen in={!splashDone} />
      <Box>{children}</Box>
    </>
  )
}

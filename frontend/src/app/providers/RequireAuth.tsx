import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/entities/user'

// AuthProvider mounts the whole router straight away — it only *hides* it
// (visibility: hidden behind the splash) until the session check resolves,
// it doesn't delay mounting. So on a hard refresh this renders while status
// is still 'idle'/'checking', before refreshAccessToken() has had a chance
// to run. Redirecting on that transient state would bounce an actually-
// logged-in user to /login every time they reload /cart or /favorites —
// render nothing until status is conclusively settled.
export function RequireAuth() {
  const status = useAuthStore((s) => s.status)

  if (status === 'idle' || status === 'checking') {
    return null
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

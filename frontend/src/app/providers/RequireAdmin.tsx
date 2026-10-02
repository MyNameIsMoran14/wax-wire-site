import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/entities/user'

// Same race as RequireAuth: AuthProvider mounts the router immediately and
// only hides it visually until the session check resolves, so this can
// render while `user` is still null from a fresh page load — redirecting
// then would kick a reloading admin out before refreshAccessToken() runs.
export function RequireAdmin() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)

  if (status === 'idle' || status === 'checking') {
    return null
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

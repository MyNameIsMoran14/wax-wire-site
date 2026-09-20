import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/entities/user'

// By the time any route renders, AuthProvider has already resolved auth
// status behind the splash — no loading state to handle here, just redirect
// non-admins straight back to the storefront.
export function RequireAdmin() {
  const user = useAuthStore((s) => s.user)

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

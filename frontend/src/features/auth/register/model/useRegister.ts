import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user'
import { registerRequest } from '../api/registerRequest'

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => setAuth(data.user, data.accessToken),
  })
}

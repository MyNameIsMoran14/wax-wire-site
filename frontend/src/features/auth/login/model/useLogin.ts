import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user'
import { loginRequest } from '../api/loginRequest'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => setAuth(data.user, data.accessToken),
  })
}

import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user'
import { profileApi } from '../api/profileApi'
import type { UpdatePasswordPayload, UpdateProfilePayload } from '../api/profileApi'

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
    onSuccess: (data) => setUser(data.user),
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => profileApi.updatePassword(payload),
  })
}

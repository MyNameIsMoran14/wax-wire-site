import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user'
import { profileApi } from '../api/profileApi'
import type { ProfileImageKind, UpdatePasswordPayload, UpdateProfilePayload } from '../api/profileApi'

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
    onSuccess: (data) => {
      const current = useAuthStore.getState().user
      if (current?.id === data.user.id) {
        setUser({ ...current, name: data.user.name, email: data.user.email })
      }
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => profileApi.updatePassword(payload),
  })
}

export function useUpdateProfileImage() {
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: ({ kind, file }: { kind: ProfileImageKind; file: File | null }) => profileApi.updateImage(kind, file),
    onSuccess: (data, { kind }) => {
      const current = useAuthStore.getState().user
      if (current?.id === data.user.id) {
        const field = kind === 'avatar' ? 'avatar_url' : 'banner_url'
        setUser({ ...current, [field]: data.user[field] })
      }
    },
  })
}

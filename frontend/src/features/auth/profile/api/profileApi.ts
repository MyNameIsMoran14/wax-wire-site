import type { User } from '@/entities/user'
import { httpClient } from '@/shared/api/httpClient'

export interface UpdateProfilePayload {
  name: string
  email: string
}

export interface UpdatePasswordPayload {
  current_password: string
  new_password: string
}

export type ProfileImageKind = 'avatar' | 'banner'

export const profileApi = {
  updateImage: (kind: ProfileImageKind, file: File | null) => {
    const path = `/auth/me/images/${kind}`
    if (!file) return httpClient.delete<{ user: User }>(path)
    const form = new FormData()
    form.append('image', file)
    return httpClient.postForm<{ user: User }>(path, form)
  },
  updateProfile: (payload: UpdateProfilePayload) => httpClient.patch<{ user: User }>('/auth/me', payload),
  updatePassword: (payload: UpdatePasswordPayload) => httpClient.patch<void>('/auth/me/password', payload),
}

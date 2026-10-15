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

export const profileApi = {
  updateProfile: (payload: UpdateProfilePayload) => httpClient.patch<{ user: User }>('/auth/me', payload),
  updatePassword: (payload: UpdatePasswordPayload) => httpClient.patch<void>('/auth/me/password', payload),
}

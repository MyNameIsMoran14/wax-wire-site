import type { AuthResponse } from '@/entities/user'
import { httpClient } from '@/shared/api/httpClient'

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export function registerRequest(payload: RegisterPayload) {
  return httpClient.post<AuthResponse>('/auth/register', payload)
}

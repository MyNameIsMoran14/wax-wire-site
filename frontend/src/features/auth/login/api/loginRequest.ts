import type { AuthResponse } from '@/entities/user'
import { httpClient } from '@/shared/api/httpClient'

export interface LoginPayload {
  email: string
  password: string
}

export function loginRequest(payload: LoginPayload) {
  return httpClient.post<AuthResponse>('/auth/login', payload)
}

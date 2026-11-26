export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  avatar_url?: string | null
  banner_url?: string | null
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
}

export interface AuthResponse {
  user: User
  accessToken: string
}

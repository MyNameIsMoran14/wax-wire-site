import { create } from 'zustand'
import { tokenStorage } from '@/shared/api/tokenStorage'
import type { User } from './types'

interface AuthState {
  user: User | null
  status: 'idle' | 'checking' | 'authenticated' | 'guest'
  setAuth: (user: User, accessToken: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  setChecking: () => void
  setGuest: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  setAuth: (user, accessToken) => {
    tokenStorage.set(accessToken)
    set({ user, status: 'authenticated' })
  },
  // No new token involved — just the profile fields changing underneath an
  // already-authenticated session (name/email edit).
  setUser: (user) => set({ user }),
  clearAuth: () => {
    tokenStorage.set(null)
    set({ user: null, status: 'guest' })
  },
  setChecking: () => set({ status: 'checking' }),
  setGuest: () => set({ status: 'guest' }),
}))

import { create } from 'zustand'

interface AppReadyState {
  ready: boolean
  setReady: () => void
}

// Flips true once the splash (spinning-record) animation has fully finished.
// Every entrance animation on every page waits on this instead of its own
// mount lifecycle, so nothing fades in while it's still hidden behind the splash.
export const useAppReadyStore = create<AppReadyState>((set) => ({
  ready: false,
  setReady: () => set({ ready: true }),
}))

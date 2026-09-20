import { create } from 'zustand'

interface FavoriteState {
  ids: Set<number>
  toggle: (productId: number) => void
}

// Frontend-only for now (no backend /favorites yet) — swapping this for a
// server-synced store later means changing what `toggle` does internally,
// not how any component calls it.
export const useFavoriteStore = create<FavoriteState>((set) => ({
  ids: new Set(),
  toggle: (productId) =>
    set((state) => {
      const next = new Set(state.ids)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return { ids: next }
    }),
}))

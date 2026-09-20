import { create } from 'zustand'
import type { CartItem } from './types'

interface CartState {
  items: CartItem[]
  add: (productId: number, quantity?: number) => void
  remove: (productId: number) => void
  setQuantity: (productId: number, quantity: number) => void
}

// Frontend-only for now (no backend /cart yet) — tied to the browser tab,
// not the account. Swapping to server-synced cart later is a matter of
// replacing these three actions with API calls, same call sites everywhere else.
export const useCartStore = create<CartState>((set) => ({
  items: [],
  add: (productId, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((item) => item.productId === productId)
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
          ),
        }
      }
      return { items: [...state.items, { productId, quantity }] }
    }),
  remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
  setQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.productId !== productId) }
      }
      return { items: state.items.map((item) => (item.productId === productId ? { ...item, quantity } : item)) }
    }),
}))

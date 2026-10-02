import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user'
import { cartApi } from '../api/cartApi'

const CART_KEY = ['cart']

// Cart lives on the server now (requires login, per the API contract) — no
// more local-only zustand state. Disabled while logged out so a guest
// doesn't fire a doomed authenticated request.
export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')
  return useQuery({ queryKey: CART_KEY, queryFn: cartApi.fetchCart, enabled: isAuthenticated })
}

// Every cart mutation's response is the fresh, full cart — write it straight
// into the cache instead of invalidating and round-tripping a GET.
export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity?: number }) => cartApi.addItem(productId, quantity),
    onSuccess: (cart) => queryClient.setQueryData(CART_KEY, cart),
  })
}

export function useSetCartQuantity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) => cartApi.setQuantity(productId, quantity),
    onSuccess: (cart) => queryClient.setQueryData(CART_KEY, cart),
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productId: number) => cartApi.removeItem(productId),
    onSuccess: (cart) => queryClient.setQueryData(CART_KEY, cart),
  })
}

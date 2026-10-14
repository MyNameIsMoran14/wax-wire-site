import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user'
import { orderApi } from '../api/orderApi'
import type { CreateOrderPayload } from './types'

const ORDERS_KEY = ['orders']
const CART_KEY = ['cart']

export function useOrders() {
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')
  return useQuery({ queryKey: ORDERS_KEY, queryFn: orderApi.fetchOrders, enabled: isAuthenticated })
}

export function useOrder(id: number) {
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')
  return useQuery({ queryKey: ['order', id], queryFn: () => orderApi.fetchOrder(id), enabled: isAuthenticated && Number.isFinite(id) })
}

// Checkout clears the cart server-side, so a successful order also
// invalidates the cart query — otherwise CartPage would keep showing
// already-ordered items until something else happened to refetch it.
export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderApi.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY })
      queryClient.invalidateQueries({ queryKey: CART_KEY })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from './adminApi'
import type { OrderStatus } from './types'

export function useAdminOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: ['admin', 'orders', status ?? 'all'],
    queryFn: () => adminApi.fetchOrders(status),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => adminApi.updateOrderStatus(id, status),
    // Keyed queries differ per status filter, so invalidate the whole
    // ['admin', 'orders', ...] family rather than one specific key.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  })
}

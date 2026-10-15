import { httpClient } from '@/shared/api/httpClient'
import type { CreateOrderPayload, Order } from '../model/types'

export const orderApi = {
  fetchOrders: () => httpClient.get<Order[]>('/orders'),
  fetchOrder: (id: number) => httpClient.get<Order>(`/orders/${id}`),
  createOrder: (payload: CreateOrderPayload) => httpClient.post<Order>('/orders', payload),
  cancelOrder: (id: number) => httpClient.patch<Order>(`/orders/${id}/cancel`),
}

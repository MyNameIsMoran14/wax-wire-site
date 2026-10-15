import { httpClient } from '@/shared/api/httpClient'
import type { Product } from '@/entities/product'

export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: string
}

export const cartApi = {
  fetchCart: () => httpClient.get<Cart>('/cart'),
  addItem: (productId: number, quantity = 1) => httpClient.post<Cart>('/cart/items', { product_id: productId, quantity }),
  setQuantity: (productId: number, quantity: number) => httpClient.patch<Cart>(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId: number) => httpClient.delete<Cart>(`/cart/items/${productId}`),
}

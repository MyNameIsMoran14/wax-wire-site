import { httpClient } from '@/shared/api/httpClient'
import type { Product } from '@/entities/product'

export const favoriteApi = {
  fetchFavorites: () => httpClient.get<Product[]>('/favorites'),
  add: (productId: number) => httpClient.post<void>(`/favorites/${productId}`),
  remove: (productId: number) => httpClient.delete<void>(`/favorites/${productId}`),
}

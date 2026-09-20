import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '../api/catalogApi'

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogApi.fetchProduct(id),
    enabled: Number.isFinite(id),
  })
}

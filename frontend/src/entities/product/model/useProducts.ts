import { useInfiniteQuery } from '@tanstack/react-query'
import { catalogApi, type ProductsFilters } from '../api/catalogApi'

// Filters (not page) form the query key — changing a filter starts a fresh
// paginated sequence from page 1, exactly like a new search should.
export function useProducts(filters: ProductsFilters) {
  return useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: ({ pageParam }) => catalogApi.fetchProducts(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.items.length, 0)
      return loadedCount < lastPage.total ? lastPage.page + 1 : undefined
    },
  })
}

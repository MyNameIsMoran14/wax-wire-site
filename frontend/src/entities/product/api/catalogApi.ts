import { httpClient } from '@/shared/api/httpClient'
import type { Genre, Product, ProductDetail, ProductType } from '../model/types'

export type SortOption = 'new' | 'price_asc' | 'price_desc'

export interface ProductsFilters {
  q?: string
  type?: ProductType
  price_min?: string
  price_max?: string
  genre?: number
  sort?: SortOption
}

export interface ProductsPage {
  items: Product[]
  page: number
  total: number
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const catalogApi = {
  fetchProducts: (filters: ProductsFilters, page: number) =>
    httpClient.get<ProductsPage>(`/products${buildQuery({ ...filters, page })}`),
  fetchProduct: (id: number) => httpClient.get<ProductDetail>(`/products/${id}`),
  fetchGenres: () => httpClient.get<Genre[]>('/genres'),
}

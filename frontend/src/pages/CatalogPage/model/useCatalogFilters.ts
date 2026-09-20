import { useMemo, useState } from 'react'
import type { Product, ProductType } from '@/entities/product'

export type SortOption = 'new' | 'price_asc' | 'price_desc'

export interface CatalogFiltersState {
  q: string
  type: ProductType | 'all'
  priceMin: string
  priceMax: string
  sort: SortOption
}

const INITIAL_FILTERS: CatalogFiltersState = {
  q: '',
  type: 'all',
  priceMin: '',
  priceMax: '',
  sort: 'new',
}

// Field names mirror the real /products query params (type, q, price_min,
// price_max, sort) on purpose — swapping this local filter for a real fetch
// later is a matter of sending `filters` as-is, not redesigning the state shape.
export function useCatalogFilters(products: Product[], initialQuery = '') {
  const [filters, setFilters] = useState<CatalogFiltersState>({ ...INITIAL_FILTERS, q: initialQuery })

  const results = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const min = filters.priceMin !== '' ? Number(filters.priceMin) : null
    const max = filters.priceMax !== '' ? Number(filters.priceMax) : null

    const filtered = products.filter((product) => {
      if (filters.type !== 'all' && product.type !== filters.type) return false
      if (q && !`${product.artist} ${product.title}`.toLowerCase().includes(q)) return false
      const price = Number(product.price)
      if (min !== null && price < min) return false
      if (max !== null && price > max) return false
      return true
    })

    return filtered.sort((a, b) => {
      if (filters.sort === 'price_asc') return Number(a.price) - Number(b.price)
      if (filters.sort === 'price_desc') return Number(b.price) - Number(a.price)
      return b.id - a.id // "new" — mock data has no created_at spread, id proxies recency
    })
  }, [products, filters])

  function setFilter<K extends keyof CatalogFiltersState>(key: K, value: CatalogFiltersState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setFilters(INITIAL_FILTERS)
  }

  return { filters, setFilter, reset, results }
}

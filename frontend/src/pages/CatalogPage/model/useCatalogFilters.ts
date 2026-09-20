import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Product, ProductType } from '@/entities/product'

export type SortOption = 'new' | 'price_asc' | 'price_desc'

export interface CatalogFiltersState {
  q: string
  type: ProductType | 'all'
  priceMin: string
  priceMax: string
  sort: SortOption
}

const DEFAULTS: CatalogFiltersState = {
  q: '',
  type: 'all',
  priceMin: '',
  priceMax: '',
  sort: 'new',
}

const PARAM_KEYS: Record<keyof CatalogFiltersState, string> = {
  q: 'q',
  type: 'type',
  priceMin: 'price_min',
  priceMax: 'price_max',
  sort: 'sort',
}

const isProductType = (value: string): value is ProductType =>
  value === 'vinyl' || value === 'cd' || value === 'equipment'
const isSortOption = (value: string): value is SortOption =>
  value === 'new' || value === 'price_asc' || value === 'price_desc'

// Filters live in the URL (not local state) so the field names mirror the
// real /products query params (type, q, price_min, price_max, sort) and a
// filtered catalog view stays shareable/bookmarkable and survives reloads.
export function useCatalogFilters(products: Product[]) {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: CatalogFiltersState = useMemo(() => {
    const type = searchParams.get(PARAM_KEYS.type)
    const sort = searchParams.get(PARAM_KEYS.sort)
    return {
      q: searchParams.get(PARAM_KEYS.q) ?? DEFAULTS.q,
      type: type && isProductType(type) ? type : DEFAULTS.type,
      priceMin: searchParams.get(PARAM_KEYS.priceMin) ?? DEFAULTS.priceMin,
      priceMax: searchParams.get(PARAM_KEYS.priceMax) ?? DEFAULTS.priceMax,
      sort: sort && isSortOption(sort) ? sort : DEFAULTS.sort,
    }
  }, [searchParams])

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
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      const paramKey = PARAM_KEYS[key]
      if (value === '' || value === DEFAULTS[key]) next.delete(paramKey)
      else next.set(paramKey, String(value))
      return next
    })
  }

  function reset() {
    setSearchParams(new URLSearchParams())
  }

  return { filters, setFilter, reset, results }
}

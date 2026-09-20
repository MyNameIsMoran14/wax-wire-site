import { useSearchParams } from 'react-router-dom'
import type { ProductType, SortOption } from '@/entities/product'

export interface CatalogFiltersState {
  q: string
  type: ProductType | 'all'
  genre: string // '' = all, else a genre id
  priceMin: string
  priceMax: string
  sort: SortOption
}

const DEFAULTS: CatalogFiltersState = {
  q: '',
  type: 'all',
  genre: '',
  priceMin: '',
  priceMax: '',
  sort: 'new',
}

const PARAM_KEYS: Record<keyof CatalogFiltersState, string> = {
  q: 'q',
  type: 'type',
  genre: 'genre',
  priceMin: 'price_min',
  priceMax: 'price_max',
  sort: 'sort',
}

const isProductType = (value: string): value is ProductType =>
  value === 'vinyl' || value === 'cd' || value === 'equipment'
const isSortOption = (value: string): value is SortOption =>
  value === 'new' || value === 'price_asc' || value === 'price_desc'

// Filters live in the URL (not local state) so the field names mirror the
// real /products query params (type, q, price_min, price_max, genre, sort)
// and a filtered catalog view stays shareable/bookmarkable and survives reloads.
export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const type = searchParams.get(PARAM_KEYS.type)
  const sort = searchParams.get(PARAM_KEYS.sort)
  const filters: CatalogFiltersState = {
    q: searchParams.get(PARAM_KEYS.q) ?? DEFAULTS.q,
    type: type && isProductType(type) ? type : DEFAULTS.type,
    genre: searchParams.get(PARAM_KEYS.genre) ?? DEFAULTS.genre,
    priceMin: searchParams.get(PARAM_KEYS.priceMin) ?? DEFAULTS.priceMin,
    priceMax: searchParams.get(PARAM_KEYS.priceMax) ?? DEFAULTS.priceMax,
    sort: sort && isSortOption(sort) ? sort : DEFAULTS.sort,
  }

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

  return { filters, setFilter, reset }
}

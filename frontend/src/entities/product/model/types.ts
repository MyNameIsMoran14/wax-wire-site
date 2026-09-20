export type ProductType = 'vinyl' | 'cd' | 'equipment'

export interface Genre {
  id: number
  name: string
}

export interface TracklistItem {
  position: number
  title: string
  duration_seconds: number
}

export interface Product {
  id: number
  title: string
  artist: string
  genre: Genre | null
  type: ProductType
  price: string
  stock: number
  year: number | null
  description: string | null
  cover_url: string | null
  created_at: string
}

export interface ProductDetail extends Product {
  tracklist: TracklistItem[]
}

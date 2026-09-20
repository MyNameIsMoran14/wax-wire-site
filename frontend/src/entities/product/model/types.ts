export type ProductType = 'vinyl' | 'cd' | 'equipment'

export interface Genre {
  id: number
  name: string
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
  coverUrl: string | null
}

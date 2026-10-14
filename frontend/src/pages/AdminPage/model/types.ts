export type ProductType = 'vinyl' | 'cd' | 'equipment'

export interface Genre {
  id: number
  name: string
}

export interface AdminProduct {
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

export interface ProductFormValues {
  title: string
  artist: string
  genreId: string // '' = no genre (equipment)
  type: ProductType
  price: string
  stock: string
  year: string
  description: string
}

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  title: '',
  artist: '',
  genreId: '',
  type: 'vinyl',
  price: '',
  stock: '',
  year: '',
  description: '',
}

export function productToFormValues(product: AdminProduct): ProductFormValues {
  return {
    title: product.title,
    artist: product.artist,
    genreId: product.genre ? String(product.genre.id) : '',
    type: product.type,
    price: product.price,
    stock: String(product.stock),
    year: product.year !== null ? String(product.year) : '',
    description: product.description ?? '',
  }
}

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled'

export interface AdminOrderItem {
  product_id: number | null
  title_snapshot: string
  price_snapshot: string
  quantity: number
}

export interface AdminOrder {
  id: number
  status: OrderStatus
  total: string
  address: string
  phone: string
  comment: string | null
  items: AdminOrderItem[]
  created_at: string
  user: { id: number; name: string; email: string }
}

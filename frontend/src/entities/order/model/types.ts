export type OrderStatus = 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled'

export interface OrderItem {
  product_id: number | null
  title_snapshot: string
  price_snapshot: string
  quantity: number
}

export interface Order {
  id: number
  status: OrderStatus
  total: string
  address: string
  phone: string
  comment: string | null
  items: OrderItem[]
  created_at: string
}

export interface CreateOrderPayload {
  address: string
  phone: string
  comment?: string
}

import { httpClient } from '@/shared/api/httpClient'
import type { AdminProduct, Genre, ProductFormValues } from './types'

function toPayload(values: ProductFormValues) {
  return {
    title: values.title.trim(),
    artist: values.artist.trim(),
    genre_id: values.genreId === '' ? null : Number(values.genreId),
    type: values.type,
    price: values.price,
    stock: Number(values.stock),
    year: values.year === '' ? null : Number(values.year),
    description: values.description.trim() === '' ? null : values.description.trim(),
  }
}

export const adminApi = {
  fetchProducts: () => httpClient.get<AdminProduct[]>('/admin/products'),
  createProduct: (values: ProductFormValues) => httpClient.post<AdminProduct>('/admin/products', toPayload(values)),
  updateProduct: (id: number, values: ProductFormValues) =>
    httpClient.patch<AdminProduct>(`/admin/products/${id}`, toPayload(values)),
  deleteProduct: (id: number) => httpClient.delete<void>(`/admin/products/${id}`),
  uploadProductImage: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return httpClient.postForm<AdminProduct>(`/admin/products/${id}/image`, formData)
  },

  fetchGenres: () => httpClient.get<Genre[]>('/admin/genres'),
  createGenre: (name: string) => httpClient.post<Genre>('/admin/genres', { name: name.trim() }),
  updateGenre: (id: number, name: string) => httpClient.patch<Genre>(`/admin/genres/${id}`, { name: name.trim() }),
  deleteGenre: (id: number) => httpClient.delete<void>(`/admin/genres/${id}`),
}

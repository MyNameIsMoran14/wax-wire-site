import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from './adminApi'
import type { ProductFormValues } from './types'

const PRODUCTS_KEY = ['admin', 'products']

// The whole catalog comes back in one request — pagination is purely a
// rendering concern (see the scroll-triggered reveal in ProductsTab), not a
// network one. Fine for admin-panel catalog sizes; would need revisiting
// if the catalog ever grew into the thousands.
export function useAdminProducts() {
  return useQuery({ queryKey: PRODUCTS_KEY, queryFn: adminApi.fetchProducts })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ProductFormValues) => adminApi.createProduct(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: ProductFormValues }) => adminApi.updateProduct(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  })
}

export function useUploadProductImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => adminApi.uploadProductImage(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  })
}

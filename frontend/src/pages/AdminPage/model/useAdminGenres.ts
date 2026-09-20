import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from './adminApi'

const GENRES_KEY = ['admin', 'genres']
const PRODUCTS_KEY = ['admin', 'products']

export function useAdminGenres() {
  return useQuery({ queryKey: GENRES_KEY, queryFn: adminApi.fetchGenres })
}

export function useCreateGenre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => adminApi.createGenre(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GENRES_KEY }),
  })
}

export function useUpdateGenre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => adminApi.updateGenre(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GENRES_KEY }),
  })
}

export function useDeleteGenre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteGenre(id),
    // Deleting a genre just nulls it out on any products that used it (FK is
    // ON DELETE SET NULL) — those rows live in the products cache, so that
    // needs invalidating too or the admin table would show a stale genre.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GENRES_KEY })
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
    },
  })
}

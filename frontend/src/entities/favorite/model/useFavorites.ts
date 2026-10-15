import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/entities/user'
import { favoriteApi } from '../api/favoriteApi'

const FAVORITES_KEY = ['favorites']

// Favorites live on the server now (requires login) — disabled while logged
// out so a guest doesn't fire a doomed authenticated request.
export function useFavorites() {
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')
  return useQuery({ queryKey: FAVORITES_KEY, queryFn: favoriteApi.fetchFavorites, enabled: isAuthenticated })
}

// add/remove return 204 (no body to write into the cache), so this
// invalidates and refetches rather than patching the cache by hand.
export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, isFavorited }: { productId: number; isFavorited: boolean }) =>
      isFavorited ? favoriteApi.remove(productId) : favoriteApi.add(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FAVORITES_KEY }),
  })
}

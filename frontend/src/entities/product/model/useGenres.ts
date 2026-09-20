import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '../api/catalogApi'

export function useGenres() {
  return useQuery({ queryKey: ['genres'], queryFn: catalogApi.fetchGenres })
}

import { Box, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useFavorites, useToggleFavorite } from '@/entities/favorite'
import { useAuthStore } from '@/entities/user'
import { resolveAssetUrl } from '@/shared/config/env'
import { PulseHeart } from '@/shared/ui/PulseHeart'
import type { Product } from '../model/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')
  const favorites = useFavorites()
  const toggleFavorite = useToggleFavorite()
  const liked = favorites.data?.some((p) => p.id === product.id) ?? false

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    toggleFavorite.mutate({ productId: product.id, isFavorited: liked })
  }

  return (
    <Stack
      component={RouterLink}
      to={`/catalog/${product.id}`}
      spacing={1.5}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        '&:hover .product-card-cover': { opacity: 0.85 },
        '&:hover .product-card-price': { color: '#8C2F27' },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          className="product-card-cover"
          sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            bgcolor: 'divider',
            borderRadius: 0.5,
            backgroundImage: product.cover_url ? `url(${resolveAssetUrl(product.cover_url)})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'opacity 300ms ease',
          }}
        />
        <Box
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <PulseHeart
            liked={liked}
            showCount={false}
            size={30}
            onChange={handleToggleFavorite}
            label="В избранное"
          />
        </Box>
      </Box>
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
          {product.artist} — {product.title}
        </Typography>
        <Typography
          className="product-card-price"
          variant="body2"
          sx={{ fontWeight: 600, whiteSpace: 'nowrap', transition: 'color 300ms ease' }}
        >
          {Number(product.price).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
        </Typography>
      </Stack>
    </Stack>
  )
}

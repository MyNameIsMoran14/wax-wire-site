import { Box, Stack, Typography } from '@mui/material'
import type { Product } from '../model/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        cursor: 'pointer',
        '&:hover .product-card-cover': { opacity: 0.85 },
        '&:hover .product-card-price': { color: '#8C2F27' },
      }}
    >
      <Box
        className="product-card-cover"
        sx={{
          width: '100%',
          aspectRatio: '1 / 1',
          bgcolor: 'divider',
          borderRadius: 0.5,
          backgroundImage: product.coverUrl ? `url(${product.coverUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'opacity 300ms ease',
        }}
      />
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
          {product.artist} — {product.title}
        </Typography>
        <Typography
          className="product-card-price"
          variant="body2"
          sx={{ fontWeight: 600, whiteSpace: 'nowrap', transition: 'color 300ms ease' }}
        >
          {Number(product.price).toLocaleString('ru-RU')} ₽
        </Typography>
      </Stack>
    </Stack>
  )
}

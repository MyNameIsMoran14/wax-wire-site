import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { useCartStore } from '@/entities/cart'
import { useFavoriteStore } from '@/entities/favorite'
import { MOCK_PRODUCTS } from '@/entities/product'
import { PulseHeart } from '@/shared/ui/PulseHeart'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'

const TYPE_LABELS: Record<string, string> = {
  vinyl: 'Винил',
  cd: 'CD',
  equipment: 'Оборудование',
}

// Placeholder tracklist until the backend has real track data — vinyl/CD
// items get a two-side listing, equipment gets none.
const MOCK_TRACKLIST = ['Side A', 'Side B'].flatMap((side) =>
  Array.from({ length: 4 }, (_, i) => `${side}${i + 1}. Track ${i + 1}`),
)

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const product = useMemo(() => MOCK_PRODUCTS.find((p) => p.id === Number(id)), [id])
  const [quantity, setQuantity] = useState(1)

  const liked = useFavoriteStore((state) => (product ? state.ids.has(product.id) : false))
  const toggleFavorite = useFavoriteStore((state) => state.toggle)
  const addToCart = useCartStore((state) => state.add)

  if (!product) {
    return (
      <Stack>
        <Header />
        <Reveal>
          <Stack sx={{ alignItems: 'center', py: 12, px: 3, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Товар не найден
            </Typography>
            <Button component={RouterLink} to="/catalog" variant="outlined" sx={{ mt: 3 }}>
              Вернуться в каталог
            </Button>
          </Stack>
        </Reveal>
        <Footer />
      </Stack>
    )
  }

  const showTracklist = product.type !== 'equipment'

  return (
    <Stack>
      <Header />

      <Reveal>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 8 }} sx={{ px: { xs: 3, md: 8 }, py: 6 }}>
          <Box
            sx={{
              width: { xs: '100%', md: 420 },
              flexShrink: 0,
              aspectRatio: '1 / 1',
              bgcolor: 'divider',
              borderRadius: 1,
              backgroundImage: product.coverUrl ? `url(${product.coverUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          <Stack spacing={3} sx={{ flexGrow: 1 }}>
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                {TYPE_LABELS[product.type] ?? product.type}
                {product.year ? ` · ${product.year}` : ''}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {product.artist}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {product.title}
              </Typography>
            </Stack>

            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {Number(product.price).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <IconButton
                  size="small"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Уменьшить количество"
                >
                  −
                </IconButton>
                <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{quantity}</Typography>
                <IconButton
                  size="small"
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Увеличить количество"
                >
                  +
                </IconButton>
              </Stack>

              <Button
                variant="contained"
                disabled={product.stock === 0}
                onClick={() => addToCart(product.id, quantity)}
              >
                В корзину
              </Button>

              <PulseHeart
                liked={liked}
                showCount={false}
                size={26}
                onChange={() => toggleFavorite(product.id)}
                label="В избранное"
              />
            </Stack>

            {showTracklist ? (
              <Stack spacing={1} sx={{ pt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Треклист
                </Typography>
                <Stack spacing={0.5}>
                  {MOCK_TRACKLIST.map((track) => (
                    <Typography key={track} variant="body2" color="text.secondary">
                      {track}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            ) : null}
          </Stack>
        </Stack>
      </Reveal>

      <Footer />
    </Stack>
  )
}

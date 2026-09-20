import { Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { useCartStore } from '@/entities/cart'
import { useFavoriteStore } from '@/entities/favorite'
import { useProduct } from '@/entities/product'
import { resolveAssetUrl } from '@/shared/config/env'
import { PulseHeart } from '@/shared/ui/PulseHeart'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'

const TYPE_LABELS: Record<string, string> = {
  vinyl: 'Винил',
  cd: 'CD',
  equipment: 'Оборудование',
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const product = useProduct(Number(id))
  const [quantity, setQuantity] = useState(1)

  const liked = useFavoriteStore((state) => (product.data ? state.ids.has(product.data.id) : false))
  const toggleFavorite = useFavoriteStore((state) => state.toggle)
  const addToCart = useCartStore((state) => state.add)

  if (product.isLoading) {
    return (
      <Stack>
        <Header />
        <Stack sx={{ alignItems: 'center', py: 12 }}>
          <CircularProgress />
        </Stack>
        <Footer />
      </Stack>
    )
  }

  if (product.isError || !product.data) {
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

  const item = product.data
  const showTracklist = item.type !== 'equipment'

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
              backgroundImage: item.cover_url ? `url(${resolveAssetUrl(item.cover_url)})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          <Stack spacing={3} sx={{ flexGrow: 1 }}>
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                {TYPE_LABELS[item.type] ?? item.type}
                {item.year ? ` · ${item.year}` : ''}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {item.artist}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {item.title}
              </Typography>
            </Stack>

            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {Number(item.price).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {item.stock > 0 ? `В наличии: ${item.stock} шт.` : 'Нет в наличии'}
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
                  disabled={quantity >= item.stock}
                  onClick={() => setQuantity((q) => Math.min(item.stock, q + 1))}
                  aria-label="Увеличить количество"
                >
                  +
                </IconButton>
              </Stack>

              <Button variant="contained" disabled={item.stock === 0} onClick={() => addToCart(item.id, quantity)}>
                В корзину
              </Button>

              <PulseHeart
                liked={liked}
                showCount={false}
                size={26}
                onChange={() => toggleFavorite(item.id)}
                label="В избранное"
              />
            </Stack>

            {item.description && (
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            )}

            {showTracklist && item.tracklist.length > 0 ? (
              <Stack spacing={1} sx={{ pt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Треклист
                </Typography>
                <Stack spacing={0.5}>
                  {item.tracklist.map((track) => (
                    <Stack key={track.position} direction="row" spacing={1.5}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 20 }}>
                        {track.position}.
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                        {track.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDuration(track.duration_seconds)}
                      </Typography>
                    </Stack>
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

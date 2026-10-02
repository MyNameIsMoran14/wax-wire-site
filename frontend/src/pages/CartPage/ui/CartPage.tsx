import { Delete, ShoppingCartOutlined } from '@mui/icons-material'
import { Alert, Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useCart, useRemoveFromCart, useSetCartQuantity } from '@/entities/cart'
import { resolveAssetUrl } from '@/shared/config/env'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'

function formatMoney(value: number | string): string {
  return Number(value).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function CartPage() {
  const cart = useCart()
  const setQuantity = useSetCartQuantity()
  const removeItem = useRemoveFromCart()

  return (
    <Stack sx={{ minHeight: '100vh' }}>
      <Header />

      <Reveal>
        <Stack spacing={4} sx={{ px: { xs: 3, md: 8 }, py: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Корзина
          </Typography>

          {cart.isLoading ? (
            <Stack sx={{ alignItems: 'center', py: 10 }}>
              <CircularProgress />
            </Stack>
          ) : cart.isError ? (
            <Alert severity="error">Не удалось загрузить корзину</Alert>
          ) : cart.data && cart.data.items.length > 0 ? (
            <Stack spacing={3} sx={{ maxWidth: 640 }}>
              <Stack spacing={2}>
                {cart.data.items.map(({ product, quantity }) => (
                  <Stack key={product.id} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Box
                      component={RouterLink}
                      to={`/catalog/${product.id}`}
                      sx={{
                        width: 64,
                        height: 64,
                        flexShrink: 0,
                        borderRadius: 1,
                        bgcolor: 'divider',
                        backgroundImage: product.cover_url ? `url(${resolveAssetUrl(product.cover_url)})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        component={RouterLink}
                        to={`/catalog/${product.id}`}
                        noWrap
                        sx={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}
                      >
                        {product.artist} — {product.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatMoney(product.price)} ₽
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <IconButton
                        size="small"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity.mutate({ productId: product.id, quantity: quantity - 1 })}
                        aria-label="Уменьшить количество"
                      >
                        −
                      </IconButton>
                      <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{quantity}</Typography>
                      <IconButton
                        size="small"
                        disabled={quantity >= product.stock}
                        onClick={() => setQuantity.mutate({ productId: product.id, quantity: quantity + 1 })}
                        aria-label="Увеличить количество"
                      >
                        +
                      </IconButton>
                    </Stack>

                    <Typography sx={{ minWidth: 110, textAlign: 'right', fontWeight: 600 }}>
                      {formatMoney(Number(product.price) * quantity)} ₽
                    </Typography>

                    <IconButton size="small" onClick={() => removeItem.mutate(product.id)} aria-label="Убрать из корзины">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>

              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'baseline', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
              >
                <Typography variant="h6">Итого</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {formatMoney(cart.data.total)} ₽
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '40vh', textAlign: 'center' }} spacing={1.5}>
              <ShoppingCartOutlined sx={{ fontSize: 40, color: 'divider' }} />
              <Typography sx={{ fontWeight: 600 }}>Корзина пуста</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
                Загляните в каталог и добавьте что-нибудь — товары появятся здесь.
              </Typography>
              <Button component={RouterLink} to="/catalog" variant="outlined" sx={{ mt: 1, borderRadius: 999 }}>
                В каталог
              </Button>
            </Stack>
          )}
        </Stack>
      </Reveal>

      <Footer />
    </Stack>
  )
}

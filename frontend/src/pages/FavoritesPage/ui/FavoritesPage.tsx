import { FavoriteBorder } from '@mui/icons-material'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useFavorites } from '@/entities/favorite'
import { ProductCard } from '@/entities/product'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'

export function FavoritesPage() {
  const favorites = useFavorites()

  return (
    <Stack sx={{ minHeight: '100vh' }}>
      <Header />

      <Reveal>
        <Stack spacing={4} sx={{ px: { xs: 3, md: 8 }, py: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Избранное
          </Typography>

          {favorites.isLoading ? (
            <Stack sx={{ alignItems: 'center', py: 10 }}>
              <CircularProgress />
            </Stack>
          ) : favorites.data && favorites.data.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                columnGap: 3,
                rowGap: 5,
              }}
            >
              {favorites.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Box>
          ) : (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '40vh', textAlign: 'center' }} spacing={1.5}>
              <FavoriteBorder sx={{ fontSize: 40, color: 'divider' }} />
              <Typography sx={{ fontWeight: 600 }}>Пока ничего нет</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
                Нажимайте на сердечко у товара в каталоге — он появится здесь.
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

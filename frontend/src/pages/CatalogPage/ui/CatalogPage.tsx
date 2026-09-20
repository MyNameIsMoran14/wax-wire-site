import { Box, Stack, Typography } from '@mui/material'
import { ProductCard } from '@/entities/product'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import { MOCK_PRODUCTS } from '../model/mockProducts'

export function CatalogPage() {
  return (
    <Stack>
      <Header />

      <Stack sx={{ px: { xs: 3, md: 8 }, py: 6 }}>
        <Reveal>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Каталог
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {MOCK_PRODUCTS.length} товаров
            </Typography>
          </Stack>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
            columnGap: 3,
            rowGap: 5,
          }}
        >
          {MOCK_PRODUCTS.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 80}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </Box>
      </Stack>

      <Footer />
    </Stack>
  )
}

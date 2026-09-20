import { Box, MenuItem, Select, type SelectChangeEvent, Stack, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '@/entities/product'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import { MOCK_PRODUCTS } from '../model/mockProducts'
import { type SortOption, useCatalogFilters } from '../model/useCatalogFilters'
import { CatalogFilters } from './CatalogFilters'

const SORT_LABELS: Record<SortOption, string> = {
  new: 'Сначала новые',
  price_asc: 'Сначала дешёвые',
  price_desc: 'Сначала дорогие',
}

export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const { filters, setFilter, reset, results } = useCatalogFilters(MOCK_PRODUCTS, searchParams.get('q') ?? '')

  return (
    <Stack>
      <Header />

      <Stack sx={{ px: { xs: 3, md: 8 }, py: 6 }}>
        <Reveal>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Каталог
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {results.length} товаров
              </Typography>
              <Select
                size="small"
                value={filters.sort}
                onChange={(e: SelectChangeEvent) => setFilter('sort', e.target.value as SortOption)}
                sx={{ minWidth: 180 }}
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                  <MenuItem key={option} value={option}>
                    {SORT_LABELS[option]}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Stack>
        </Reveal>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 6 }}>
          <CatalogFilters filters={filters} onFilterChange={setFilter} onReset={reset} />

          {results.length === 0 ? (
            <Stack sx={{ flexGrow: 1, alignItems: 'center', py: 10 }}>
              <Typography sx={{ fontWeight: 600 }}>Ничего не найдено</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Попробуйте изменить фильтры или сбросить их.
              </Typography>
            </Stack>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                columnGap: 3,
                rowGap: 5,
                alignContent: 'start',
              }}
            >
              {results.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 80}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </Box>
          )}
        </Stack>
      </Stack>

      <Footer />
    </Stack>
  )
}

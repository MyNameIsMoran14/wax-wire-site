import { Alert, Box, Button, CircularProgress, MenuItem, Select, type SelectChangeEvent, Stack, Typography } from '@mui/material'
import { ProductCard, useGenres, useProducts } from '@/entities/product'
import type { ProductsFilters, SortOption } from '@/entities/product'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import { useCatalogFilters } from '../model/useCatalogFilters'
import { CatalogFilters } from './CatalogFilters'

const SORT_LABELS: Record<SortOption, string> = {
  new: 'Сначала новые',
  price_asc: 'Сначала дешёвые',
  price_desc: 'Сначала дорогие',
}

export function CatalogPage() {
  const { filters, setFilter, reset } = useCatalogFilters()
  const genres = useGenres()

  const productsFilters: ProductsFilters = {
    q: filters.q || undefined,
    type: filters.type === 'all' ? undefined : filters.type,
    genre: filters.genre ? Number(filters.genre) : undefined,
    price_min: filters.priceMin || undefined,
    price_max: filters.priceMax || undefined,
    sort: filters.sort,
  }
  const products = useProducts(productsFilters)
  const items = products.data?.pages.flatMap((page) => page.items) ?? []
  const total = products.data?.pages[0]?.total ?? 0

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
                {total} товаров
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
          <CatalogFilters filters={filters} genres={genres.data ?? []} onFilterChange={setFilter} onReset={reset} />

          <Box sx={{ flexGrow: 1 }}>
            {products.isLoading ? (
              <Stack sx={{ alignItems: 'center', py: 10 }}>
                <CircularProgress />
              </Stack>
            ) : products.isError ? (
              <Alert severity="error">Не удалось загрузить каталог</Alert>
            ) : items.length === 0 ? (
              <Stack sx={{ alignItems: 'center', py: 10 }}>
                <Typography sx={{ fontWeight: 600 }}>Ничего не найдено</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Попробуйте изменить фильтры или сбросить их.
                </Typography>
              </Stack>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                    columnGap: 3,
                    rowGap: 5,
                    alignContent: 'start',
                  }}
                >
                  {items.map((product, i) => (
                    <Reveal key={product.id} delay={(i % 4) * 80}>
                      <ProductCard product={product} />
                    </Reveal>
                  ))}
                </Box>

                {products.hasNextPage && (
                  <Stack sx={{ alignItems: 'center', mt: 6 }}>
                    <Button
                      variant="outlined"
                      onClick={() => products.fetchNextPage()}
                      loading={products.isFetchingNextPage}
                      sx={{ borderRadius: 999, px: 4 }}
                    >
                      Показать ещё
                    </Button>
                  </Stack>
                )}
              </>
            )}
          </Box>
        </Stack>
      </Stack>

      <Footer />
    </Stack>
  )
}

import { Stack, Typography } from '@mui/material'
import { Header } from '@/widgets/Header'

export function CatalogPage() {
  return (
    <Stack>
      <Header />
      <Stack sx={{ alignItems: 'center', py: 12, px: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Каталог в разработке
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Фильтры, поиск и карточки товаров появятся здесь следующим шагом.
        </Typography>
      </Stack>
    </Stack>
  )
}

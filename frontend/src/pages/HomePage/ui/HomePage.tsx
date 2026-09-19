import { Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { Header } from '@/widgets/Header'

export function HomePage() {
  return (
    <Stack>
      <Header />
      <Stack spacing={3} sx={{ alignItems: 'center', py: 12, px: 3, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 900 }}>
          VINYL SHOP
        </Typography>
        <Typography color="text.secondary">
          Магазин виниловых пластинок в Москве. Каталог и оплата — в разработке.
        </Typography>
        <Button component={RouterLink} to="/login" variant="contained" size="large" sx={{ borderRadius: 999 }}>
          Войти в аккаунт
        </Button>
      </Stack>
    </Stack>
  )
}

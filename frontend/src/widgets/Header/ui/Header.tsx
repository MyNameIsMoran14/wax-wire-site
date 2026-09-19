import { AppBar, Badge, Button, InputBase, Stack, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuthStore } from '@/entities/user'

const NAV_LINKS = [
  { label: 'Каталог', to: '/catalog' },
  { label: 'Новинки', to: '/catalog' },
  { label: 'FAQ' },
  { label: 'Как заказать' },
] as const

export function Header() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  // Cart isn't wired up yet — badge only appears once there's a real count.
  const cartCount = 0

  return (
    <AppBar
      position="relative"
      color="transparent"
      elevation={0}
      sx={{
        zIndex: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 8 }, py: 1.5, gap: 6 }}>
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{ fontWeight: 900, textDecoration: 'none', color: 'text.primary', whiteSpace: 'nowrap' }}
        >
          WAX & WIRE.
        </Typography>

        <Stack direction="row" spacing={4} sx={{ flexGrow: 1, alignItems: 'center' }}>
          {NAV_LINKS.map((link) =>
            'to' in link ? (
              <Button key={link.label} component={RouterLink} to={link.to} color="inherit">
                {link.label}
              </Button>
            ) : (
              <Button key={link.label} color="inherit">
                {link.label}
              </Button>
            ),
          )}
        </Stack>

        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <InputBase
            placeholder="Поиск пластинок…"
            sx={{
              display: { xs: 'none', lg: 'flex' },
              bgcolor: 'background.default',
              borderRadius: 999,
              px: 2,
              py: 0.75,
              fontSize: 14,
              width: 220,
            }}
          />

          <Button color="inherit" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            Избранное
          </Button>

          <Badge
            badgeContent={cartCount}
            color="primary"
            sx={{ '& .MuiBadge-badge': { right: -10, top: 2 } }}
          >
            <Button color="inherit">Корзина</Button>
          </Badge>

          {user ? (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography variant="body2">{user.name}</Typography>
              <Button onClick={clearAuth} variant="outlined" size="small" sx={{ borderRadius: 999 }}>
                Выйти
              </Button>
            </Stack>
          ) : (
            <Button component={RouterLink} to="/login" variant="outlined" sx={{ borderRadius: 999 }}>
              Войти
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

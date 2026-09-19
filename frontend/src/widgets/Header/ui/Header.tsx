import { AppBar, Box, Button, Stack, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuthStore } from '@/entities/user'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return (
    <AppBar
      position="relative"
      color="transparent"
      elevation={0}
      sx={{
        zIndex: 2,
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 8 }, py: 1.5, gap: 4 }}>
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{ fontWeight: 900, textDecoration: 'none', color: 'text.primary' }}
        >
          VINYL.
        </Typography>
        <Stack direction="row" spacing={4} sx={{ flexGrow: 1 }}>
          <Button component={RouterLink} to="/catalog" color="inherit">
            Каталог
          </Button>
          <Button component={RouterLink} to="/new" color="inherit">
            Новинки
          </Button>
        </Stack>
        <Box>
          {user ? (
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography variant="body2">{user.name}</Typography>
              <Button onClick={clearAuth} variant="outlined" size="small">
                Выйти
              </Button>
            </Stack>
          ) : (
            <Button component={RouterLink} to="/login" variant="outlined" sx={{ borderRadius: 999 }}>
              Войти
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

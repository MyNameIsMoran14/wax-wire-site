import { Box, Link as MuiLink, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { LoginForm } from '@/features/auth/login'

export function LoginPage() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, minHeight: '100vh' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'flex-end',
          p: 6,
          background: 'linear-gradient(160deg, #17140F 0%, #3a1f1a 55%, #8C2F27 100%)',
        }}
      >
        <Typography variant="h3" sx={{ color: '#F7F3EC', fontWeight: 900 }}>
          VINYL.
        </Typography>
      </Box>
      <Stack sx={{ justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <Stack spacing={4} sx={{ width: '100%', maxWidth: 380 }}>
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              С возвращением
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Войдите, чтобы продолжить покупки
            </Typography>
          </Stack>
          <LoginForm />
          <Typography variant="body2" color="text.secondary" align="center">
            Нет аккаунта?{' '}
            <MuiLink component={RouterLink} to="/register">
              Зарегистрироваться
            </MuiLink>
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}

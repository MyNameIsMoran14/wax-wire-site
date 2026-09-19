import { Link as MuiLink, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { LoginForm } from '@/features/auth/login'

export function LoginPage() {
  return (
    <Stack sx={{ justifyContent: 'center', alignItems: 'center', p: 4, height: '100%' }}>
      <Stack spacing={4} sx={{ width: '100%', maxWidth: 380 }}>
        <Stack spacing={1} sx={{ textAlign: 'center' }}>
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
  )
}

import { Link as MuiLink, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { RegisterForm } from '@/features/auth/register'

export function RegisterPage() {
  return (
    <Stack sx={{ justifyContent: 'center', alignItems: 'center', p: 4, height: '100%' }}>
      <Stack spacing={4} sx={{ width: '100%', maxWidth: 380 }}>
        <Stack spacing={1} sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Создать аккаунт
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Присоединяйтесь, чтобы собирать свою коллекцию
          </Typography>
        </Stack>
        <RegisterForm />
        <Typography variant="body2" color="text.secondary" align="center">
          Уже есть аккаунт?{' '}
          <MuiLink component={RouterLink} to="/login">
            Войти
          </MuiLink>
        </Typography>
      </Stack>
    </Stack>
  )
}

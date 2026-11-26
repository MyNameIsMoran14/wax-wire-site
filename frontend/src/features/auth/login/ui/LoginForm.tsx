import { Alert, Button, Stack, TextField } from '@mui/material'
import { type FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { env } from '@/shared/config/env'
import { ApiError } from '@/shared/api/ApiError'
import { useLogin } from '../model/useLogin'

export function LoginForm() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const googleErrors: Record<string, string> = {
    google_not_configured: 'Вход через Google ещё настраивается',
    google_cancelled: 'Вход через Google отменён',
    google_invalid_state: 'Запрос входа истёк. Попробуйте ещё раз',
    google_email_link_required: 'Для этого адреса войдите с паролем',
    google_unavailable: 'Не удалось завершить вход через Google. Попробуйте ещё раз',
  }
  const googleError = googleErrors[searchParams.get('google_error') ?? '']

  const clearGoogleError = () => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('google_error')
      return next
    }, { replace: true })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    clearGoogleError()
    login.mutate(
      { email, password },
      { onSuccess: () => navigate('/') },
    )
  }

  const errorMessage =
    login.error instanceof ApiError ? login.error.message : login.error ? 'Не удалось войти' : null

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {googleError && <Alert severity="info" onClose={clearGoogleError}>{googleError}</Alert>}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
        fullWidth
      />
      <TextField
        label="Пароль"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        autoComplete="current-password"
        fullWidth
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={login.isPending}
        fullWidth
        sx={{ borderRadius: 999 }}
      >
        Войти
      </Button>
      <Button
        component="a"
        href={`${env.apiUrl}/auth/google`}
        variant="outlined"
        size="large"
        fullWidth
        disabled={login.isPending}
        startIcon={<img src="/google.svg" width={20} height={20} alt="" aria-hidden="true" />}
        sx={{
          minHeight: 48,
          borderRadius: 999,
          borderColor: 'primary.main',
          backgroundColor: '#FFFFFF',
          color: 'primary.main',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#FFFFFF',
            borderColor: 'primary.main',
            color: 'primary.main',
            boxShadow: '0 4px 16px rgba(140, 47, 39, 0.12)',
          },
          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 3,
          },
        }}
      >
        Войти через Google
      </Button>
    </Stack>
  )
}

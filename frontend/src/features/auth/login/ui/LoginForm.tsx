import { Alert, Button, Stack, TextField } from '@mui/material'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '@/shared/api/ApiError'
import { useLogin } from '../model/useLogin'

export function LoginForm() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
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
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        fullWidth
      />
      <TextField
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
    </Stack>
  )
}

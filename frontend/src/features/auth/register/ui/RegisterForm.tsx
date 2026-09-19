import { Alert, Button, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '@/shared/api/ApiError'
import { useRegister } from '../model/useRegister'

export function RegisterForm() {
  const navigate = useNavigate()
  const register = useRegister()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [passwordMismatch, setPasswordMismatch] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setPasswordMismatch(true)
      return
    }
    setPasswordMismatch(false)
    register.mutate(
      { name, email, password },
      { onSuccess: () => navigate('/') },
    )
  }

  const errorMessage =
    register.error instanceof ApiError ? register.error.message : register.error ? 'Не удалось создать аккаунт' : null

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2.5}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {passwordMismatch && <Alert severity="warning">Пароли не совпадают</Alert>}
      <TextField
        label="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
        fullWidth
      />
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
        autoComplete="new-password"
        slotProps={{ htmlInput: { minLength: 8 } }}
        fullWidth
      />
      <TextField
        label="Повторите пароль"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
        fullWidth
      />
      <FormControlLabel
        control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />}
        label="Согласен с условиями использования"
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={register.isPending}
        disabled={!agreed}
        fullWidth
        sx={{ borderRadius: 999 }}
      >
        Создать аккаунт
      </Button>
    </Stack>
  )
}

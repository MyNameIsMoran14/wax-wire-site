import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { type FormEvent, useState } from 'react'
import { useUpdatePassword, useUpdateProfile } from '@/features/auth/profile'
import { useAuthStore } from '@/entities/user'
import { ApiError } from '@/shared/api/ApiError'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return null
  }

  return (
    <Stack sx={{ minHeight: '100vh' }}>
      <Header />

      <Reveal>
        <Stack spacing={4} sx={{ px: { xs: 3, md: 8 }, py: 6, maxWidth: 480 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Профиль
          </Typography>

          <ProfileForm name={user.name} email={user.email} />
          <PasswordForm />
        </Stack>
      </Reveal>

      <Footer />
    </Stack>
  )
}

function ProfileForm({ name: initialName, email: initialEmail }: { name: string; email: string }) {
  const updateProfile = useUpdateProfile()
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [saved, setSaved] = useState(false)

  const errorMessage = updateProfile.error instanceof ApiError ? updateProfile.error.message : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSaved(false)
    updateProfile.mutate({ name, email }, { onSuccess: () => setSaved(true) })
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}
    >
      <Stack spacing={2.5}>
        <Typography sx={{ fontWeight: 700 }}>Данные аккаунта</Typography>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {saved && <Alert severity="success">Сохранено</Alert>}
        <TextField
          label="Имя"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSaved(false)
          }}
          required
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setSaved(false)
          }}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" loading={updateProfile.isPending} sx={{ alignSelf: 'flex-start', borderRadius: 999 }}>
          Сохранить
        </Button>
      </Stack>
    </Box>
  )
}

function PasswordForm() {
  const updatePassword = useUpdatePassword()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mismatch, setMismatch] = useState(false)
  const [saved, setSaved] = useState(false)

  const errorMessage = updatePassword.error instanceof ApiError ? updatePassword.error.message : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSaved(false)
    if (newPassword !== confirmPassword) {
      setMismatch(true)
      return
    }
    setMismatch(false)
    updatePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setSaved(true)
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        },
      },
    )
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}
    >
      <Stack spacing={2.5}>
        <Typography sx={{ fontWeight: 700 }}>Сменить пароль</Typography>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {mismatch && <Alert severity="warning">Новые пароли не совпадают</Alert>}
        {saved && <Alert severity="success">Пароль изменён</Alert>}
        <TextField
          label="Текущий пароль"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
          fullWidth
        />
        <TextField
          label="Новый пароль"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
          slotProps={{ htmlInput: { minLength: 8 } }}
          fullWidth
        />
        <TextField
          label="Повторите новый пароль"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          loading={updatePassword.isPending}
          sx={{ alignSelf: 'flex-start', borderRadius: 999 }}
        >
          Сменить пароль
        </Button>
      </Stack>
    </Box>
  )
}

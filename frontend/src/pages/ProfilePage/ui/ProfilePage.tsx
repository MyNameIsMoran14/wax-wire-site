import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { type FormEvent, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useUpdatePassword, useUpdateProfile } from '@/features/auth/profile'
import { useAuthStore } from '@/entities/user'
import { ApiError } from '@/shared/api/ApiError'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import { ProfileAppearance } from './ProfileAppearance'

const buttonSx = { borderRadius: 999, px: 3, py: 1.25, boxShadow: 'none' }
const formSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  minWidth: 0,
  p: { xs: 3, sm: 4, lg: 5 },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: '#FCFAF6',
  },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(92, 86, 77, 0.25)' },
} as const

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return null
  }

  return (
    <Stack sx={{ minHeight: '100vh' }}>
      <Header />

      <Box component="main" sx={{ px: { xs: 2, sm: 4, md: 8 }, py: { xs: 4, md: 7 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Reveal>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 3, mb: { xs: 4, md: 5 } }}
            >
              <Typography component="h1" sx={{ fontSize: { xs: 36, md: 56 }, lineHeight: 1.1, letterSpacing: '-0.045em', fontWeight: 700 }}>
                Профиль
              </Typography>
              <Stack component="nav" aria-label="Личный кабинет" direction="row" sx={{ flexWrap: 'wrap', gap: 1.5 }}>
                <Button component={RouterLink} to="/orders" variant="outlined" endIcon={<ArrowOutwardIcon />} sx={buttonSx}>
                  Мои заказы
                </Button>
              </Stack>
            </Stack>

            <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '24px', overflow: 'hidden' }}>
              <ProfileAppearance user={user} />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' } }}>
                <ProfileForm key={user.id} name={user.name} email={user.email} />
                <PasswordForm />
              </Box>
            </Box>
          </Reveal>
        </Box>
      </Box>

      <Footer />
    </Stack>
  )
}

function ProfileForm({ name: initialName, email: initialEmail }: { name: string; email: string }) {
  const updateProfile = useUpdateProfile()
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [saved, setSaved] = useState(false)

  const errorMessage = updateProfile.error instanceof ApiError
    ? updateProfile.error.message
    : updateProfile.error ? 'Не удалось сохранить данные. Попробуйте ещё раз.' : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSaved(false)
    updateProfile.mutate({ name, email }, { onSuccess: () => setSaved(true) })
  }

  return (
    <Box component="form" aria-labelledby="profile-details-title" onSubmit={handleSubmit} sx={formSx}>
      <Typography id="profile-details-title" component="h2" sx={{ fontSize: { xs: 22, sm: 25 }, fontWeight: 600, letterSpacing: '-0.025em', mb: 1 }}>
        Данные аккаунта
      </Typography>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {saved && <Alert severity="success" role="status">Данные сохранены</Alert>}
      <TextField
        label="Имя"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setSaved(false)
          updateProfile.reset()
        }}
        disabled={updateProfile.isPending}
        required
        fullWidth
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setSaved(false)
          updateProfile.reset()
        }}
        disabled={updateProfile.isPending}
        required
        fullWidth
      />
      <Box sx={{ mt: 'auto', pt: 1 }}>
        <Button type="submit" variant="contained" loading={updateProfile.isPending} sx={buttonSx}>
          Сохранить изменения
        </Button>
      </Box>
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

  const errorMessage = updatePassword.error instanceof ApiError
    ? updatePassword.error.message
    : updatePassword.error ? 'Не удалось изменить пароль. Попробуйте ещё раз.' : null

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

  const clearFeedback = () => {
    setSaved(false)
    setMismatch(false)
    updatePassword.reset()
  }

  return (
    <Box
      component="form"
      aria-labelledby="profile-password-title"
      onSubmit={handleSubmit}
      sx={{
        ...formSx,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderWidth: 0,
        borderTopWidth: { xs: 1, md: 0 },
        borderLeftWidth: { xs: 0, md: 1 },
      }}
    >
      <Typography id="profile-password-title" component="h2" sx={{ fontSize: { xs: 22, sm: 25 }, fontWeight: 600, letterSpacing: '-0.025em', mb: 1 }}>
        Смена пароля
      </Typography>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {saved && <Alert severity="success" role="status">Пароль изменён</Alert>}
      <TextField
        label="Текущий пароль"
        name="currentPassword"
        type="password"
        value={currentPassword}
        onChange={(e) => {
          setCurrentPassword(e.target.value)
          clearFeedback()
        }}
        disabled={updatePassword.isPending}
        required
        autoComplete="current-password"
        fullWidth
      />
      <TextField
        label="Новый пароль"
        name="newPassword"
        type="password"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value)
          clearFeedback()
        }}
        helperText="Не менее 8 символов"
        disabled={updatePassword.isPending}
        required
        autoComplete="new-password"
        slotProps={{ htmlInput: { minLength: 8 } }}
        fullWidth
      />
      <TextField
        label="Повторите новый пароль"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value)
          clearFeedback()
        }}
        error={mismatch}
        helperText={mismatch ? 'Новые пароли не совпадают' : undefined}
        disabled={updatePassword.isPending}
        required
        autoComplete="new-password"
        fullWidth
      />
      <Box sx={{ mt: 'auto', pt: 1 }}>
        <Button type="submit" variant="outlined" loading={updatePassword.isPending} sx={buttonSx}>
          Изменить пароль
        </Button>
      </Box>
    </Box>
  )
}

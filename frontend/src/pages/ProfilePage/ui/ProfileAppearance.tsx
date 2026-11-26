import { Alert, Avatar, Box, Button, IconButton, Stack, Typography } from '@mui/material'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import { type ChangeEvent, useRef, useState } from 'react'
import type { User } from '@/entities/user'
import { useUpdateProfileImage } from '@/features/auth/profile'
import type { ProfileImageKind } from '@/features/auth/profile'
import { ApiError } from '@/shared/api/ApiError'
import { resolveAssetUrl } from '@/shared/config/env'

export function ProfileAppearance({ user }: { user: User }) {
  const updateImage = useUpdateProfileImage()
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedKind = useRef<ProfileImageKind>('banner')
  const [validationError, setValidationError] = useState<string | null>(null)
  const bannerUrl = resolveAssetUrl(user.banner_url ?? null)
  const avatarUrl = resolveAssetUrl(user.avatar_url ?? null)
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const error = validationError ?? (updateImage.error instanceof ApiError
    ? updateImage.error.message
    : updateImage.error ? 'Не удалось обновить изображение. Попробуйте ещё раз.' : null)

  const chooseImage = (kind: ProfileImageKind) => {
    selectedKind.current = kind
    inputRef.current?.click()
  }

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    updateImage.reset()
    setValidationError(null)
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setValidationError('Выберите изображение JPEG, PNG или WebP')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Изображение должно быть не больше 5 МБ')
      return
    }
    updateImage.mutate({ kind: selectedKind.current, file })
  }

  const removeImage = (kind: ProfileImageKind) => {
    setValidationError(null)
    updateImage.mutate({ kind, file: null })
  }

  return (
    <Box>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Изображение профиля" hidden onChange={uploadImage} />
      <Box sx={{ position: 'relative', bgcolor: '#F0E9DF', borderBottom: '1px solid', borderColor: 'divider' }}>
        {bannerUrl && (
          <Box component="img" src={bannerUrl} alt="" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            position: 'relative', alignItems: { xs: 'flex-start', md: 'center' },
            gap: 3, p: { xs: 3, sm: 4, lg: 5 }, minHeight: { xs: 260, sm: 210 },
            color: bannerUrl ? '#FFFFFF' : 'text.primary',
            bgcolor: bannerUrl ? 'rgba(23,20,15,0.58)' : 'transparent',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: { xs: 2, sm: 3 }, minWidth: 0, width: { xs: '100%', md: 'auto' }, flex: { md: 1 } }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={avatarUrl ?? undefined}
                alt={user.name}
                sx={{
                  width: { xs: 76, sm: 96 }, height: { xs: 76, sm: 96 },
                  bgcolor: '#17140F', border: '3px solid #F7F3EC',
                  backgroundImage: 'repeating-radial-gradient(circle, transparent 0px, transparent 5px, rgba(247,243,236,0.12) 6px, transparent 7px)',
                }}
              >
                <Box sx={{ width: '48%', height: '48%', borderRadius: '50%', bgcolor: 'primary.main', color: '#F7F3EC', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700 }}>
                  {initials || 'W'}
                </Box>
              </Avatar>
              <IconButton
                aria-label="Загрузить аватар"
                title="Загрузить аватар"
                onClick={() => chooseImage('avatar')}
                disabled={updateImage.isPending}
                sx={{
                  position: 'absolute', right: -3, bottom: -3, width: 36, height: 36,
                  bgcolor: '#FFFFFF', color: 'primary.main', border: '1px solid', borderColor: 'primary.main',
                  '&:hover': { bgcolor: '#F7F3EC' },
                  '&.Mui-disabled': { bgcolor: '#F7F3EC' },
                }}
              >
                <PhotoCameraOutlinedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: { xs: 23, sm: 30 }, fontWeight: 700, letterSpacing: '-0.025em', overflowWrap: 'anywhere' }}>
                {user.name}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: { xs: 14, sm: 16 }, overflowWrap: 'anywhere', color: bannerUrl ? 'inherit' : 'text.secondary' }}>
                {user.email}
              </Typography>
              {avatarUrl && (
                <Button onClick={() => removeImage('avatar')} disabled={updateImage.isPending} size="small" sx={{ color: 'inherit', textTransform: 'none', p: 0, mt: 1, textDecoration: 'underline' }}>
                  Сбросить аватар
                </Button>
              )}
            </Box>
          </Stack>
          <Stack sx={{ ml: { md: 'auto' }, flexShrink: 0, alignItems: 'flex-start', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PhotoCameraOutlinedIcon />}
              onClick={() => chooseImage('banner')}
              disabled={updateImage.isPending}
              sx={{ borderRadius: 999, bgcolor: '#FFFFFF', px: 2.5, py: 1.25 }}
            >
              {bannerUrl ? 'Сменить баннер' : 'Загрузить баннер'}
            </Button>
            <Typography variant="caption">JPEG, PNG, WebP · до 5 МБ</Typography>
            {bannerUrl && (
              <Button onClick={() => removeImage('banner')} disabled={updateImage.isPending} sx={{ color: 'inherit', textTransform: 'none', textDecoration: 'underline', alignSelf: 'center' }}>
                Убрать баннер
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
      <Box aria-live="polite" sx={{ '& .MuiAlert-root': { borderRadius: 0 } }}>
        {updateImage.isPending && <Alert severity="info">Сохраняем изображение…</Alert>}
        {error && (
          <Alert
            severity="error"
            onClose={() => {
              setValidationError(null)
              updateImage.reset()
            }}
          >
            {error}
          </Alert>
        )}
        {updateImage.isSuccess && <Alert severity="success" onClose={() => updateImage.reset()}>Оформление профиля сохранено</Alert>}
      </Box>
    </Box>
  )
}

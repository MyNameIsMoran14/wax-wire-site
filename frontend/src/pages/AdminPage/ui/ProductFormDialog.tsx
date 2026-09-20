import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { ApiError } from '@/shared/api/ApiError'
import { resolveAssetUrl } from '@/shared/config/env'
import { useUploadProductImage } from '../model/useAdminProducts'
import {
  EMPTY_PRODUCT_FORM,
  productToFormValues,
  type AdminProduct,
  type Genre,
  type ProductFormValues,
} from '../model/types'

const TYPE_OPTIONS: { value: ProductFormValues['type']; label: string }[] = [
  { value: 'vinyl', label: 'Винил' },
  { value: 'cd', label: 'CD' },
  { value: 'equipment', label: 'Оборудование' },
]

interface ProductFormDialogProps {
  open: boolean
  product: AdminProduct | null // null = create mode
  genres: Genre[]
  submitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: (values: ProductFormValues) => void
}

export function ProductFormDialog({ open, product, genres, submitting, error, onClose, onSubmit }: ProductFormDialogProps) {
  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const uploadImage = useUploadProductImage()

  useEffect(() => {
    if (open) {
      setValues(product ? productToFormValues(product) : EMPTY_PRODUCT_FORM)
      setCoverUrl(product?.cover_url ?? null)
      uploadImage.reset()
    }
    // Re-seed the form only when the dialog opens or the target product changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product])

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !product) return
    uploadImage.mutate(
      { id: product.id, file },
      { onSuccess: (updated) => setCoverUrl(updated.cover_url) },
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 60px rgba(23,20,15,0.2)',
          },
        },
      }}
    >
      <Stack
        component="form"
        onSubmit={handleSubmit}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{product ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {product && (
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Avatar variant="rounded" src={resolveAssetUrl(coverUrl) ?? undefined} sx={{ width: 64, height: 64, borderRadius: 3 }} />
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  loading={uploadImage.isPending}
                  sx={{ borderRadius: 999 }}
                >
                  Загрузить обложку
                  <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                </Button>
              </Stack>
            )}
            {uploadImage.isError && (
              <Alert severity="error">
                {uploadImage.error instanceof ApiError ? uploadImage.error.message : 'Не удалось загрузить обложку'}
              </Alert>
            )}

            <TextField label="Название" value={values.title} onChange={(e) => set('title', e.target.value)} required fullWidth />
            <TextField label="Исполнитель / бренд" value={values.artist} onChange={(e) => set('artist', e.target.value)} required fullWidth />

            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Тип"
                value={values.type}
                onChange={(e) => set('type', e.target.value as ProductFormValues['type'])}
                fullWidth
              >
                {TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Жанр"
                value={values.genreId}
                onChange={(e) => set('genreId', e.target.value)}
                fullWidth
              >
                <MenuItem value="">Без жанра</MenuItem>
                {genres.map((genre) => (
                  <MenuItem key={genre.id} value={String(genre.id)}>
                    {genre.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField label="Цена, ₽" value={values.price} onChange={(e) => set('price', e.target.value)} required fullWidth />
              <TextField
                label="Остаток"
                type="number"
                value={values.stock}
                onChange={(e) => set('stock', e.target.value)}
                required
                fullWidth
              />
              <TextField label="Год" type="number" value={values.year} onChange={(e) => set('year', e.target.value)} fullWidth />
            </Stack>

            <TextField
              label="Описание"
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="inherit" sx={{ borderRadius: 999 }}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" loading={submitting} sx={{ borderRadius: 999, px: 3 }}>
            Сохранить
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  )
}
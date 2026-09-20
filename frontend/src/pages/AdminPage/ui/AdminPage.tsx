import { Add } from '@mui/icons-material'
import { Alert, Button, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { type FormEvent, useState } from 'react'
import { ApiError } from '@/shared/api/ApiError'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import { useAdminGenres, useCreateGenre } from '../model/useAdminGenres'
import { useCreateProduct, useUpdateProduct } from '../model/useAdminProducts'
import type { AdminProduct, ProductFormValues } from '../model/types'
import { GenresTab } from './GenresTab'
import { ProductFormDialog } from './ProductFormDialog'
import { ProductsTab } from './ProductsTab'

type AdminTab = 'products' | 'genres'

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('products')
  const genres = useAdminGenres()

  // Product create/edit dialog lives here, not in ProductsTab — it's opened
  // both from the header button below and from clicking a row in the table.
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const productMutation = editingProduct ? updateProduct : createProduct
  const productError =
    productMutation.error instanceof ApiError
      ? productMutation.error.message
      : productMutation.isError
        ? 'Не удалось сохранить товар'
        : null

  const openCreateProduct = () => {
    setEditingProduct(null)
    createProduct.reset()
    setDialogOpen(true)
  }
  const openEditProduct = (product: AdminProduct) => {
    setEditingProduct(product)
    updateProduct.reset()
    setDialogOpen(true)
  }
  const handleSubmitProduct = (values: ProductFormValues) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, values }, { onSuccess: () => setDialogOpen(false) })
    } else {
      createProduct.mutate(values, { onSuccess: () => setDialogOpen(false) })
    }
  }

  // New-genre form — same reasoning, sits in the header row next to the tabs.
  const createGenre = useCreateGenre()
  const [newGenreName, setNewGenreName] = useState('')
  const genreError =
    createGenre.error instanceof ApiError ? createGenre.error.message : createGenre.isError ? 'Не удалось создать жанр' : null

  const handleCreateGenre = (e: FormEvent) => {
    e.preventDefault()
    if (newGenreName.trim() === '') return
    createGenre.mutate(newGenreName, { onSuccess: () => setNewGenreName('') })
  }

  return (
    <Stack>
      <Header />
      <Stack spacing={3} sx={{ px: { xs: 3, md: 8 }, py: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Админ-панель
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: 2 }}
        >
          <Tabs
            value={tab}
            onChange={(_, value: AdminTab) => setTab(value)}
            slotProps={{ indicator: { sx: { display: 'none' } } }}
            sx={{
              minHeight: 0,
              width: 'fit-content',
              bgcolor: 'background.default',
              borderRadius: 999,
              p: 0.5,
              '& .MuiTab-root': {
                minHeight: 0,
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                py: 1,
                color: 'text.secondary',
                transition: 'background-color 300ms ease, color 300ms ease, box-shadow 300ms ease',
              },
              '& .Mui-selected': {
                bgcolor: 'background.paper',
                color: '#8C2F27 !important',
                boxShadow: '0 2px 10px rgba(23,20,15,0.1)',
              },
            }}
          >
            <Tab value="products" label="Товары" />
            <Tab value="genres" label="Жанры" />
          </Tabs>

          {tab === 'products' ? (
            <Button variant="contained" startIcon={<Add />} onClick={openCreateProduct} sx={{ borderRadius: 999, px: 3 }}>
              Добавить товар
            </Button>
          ) : (
            <Stack component="form" direction="row" spacing={1.5} onSubmit={handleCreateGenre}>
              <TextField
                size="small"
                placeholder="Новый жанр"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<Add />}
                loading={createGenre.isPending}
                sx={{ borderRadius: 999, px: 3, flexShrink: 0 }}
              >
                Добавить
              </Button>
            </Stack>
          )}
        </Stack>

        {tab === 'genres' && genreError && <Alert severity="error">{genreError}</Alert>}

        {tab === 'products' ? <ProductsTab onEditProduct={openEditProduct} /> : <GenresTab />}
      </Stack>
      <Footer />

      <ProductFormDialog
        open={dialogOpen}
        product={editingProduct}
        genres={genres.data ?? []}
        submitting={productMutation.isPending}
        error={productError}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmitProduct}
      />
    </Stack>
  )
}

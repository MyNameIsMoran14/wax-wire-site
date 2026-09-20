import { Delete } from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { resolveAssetUrl } from '@/shared/config/env'
import { useInView } from '@/shared/lib/useInView'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useAdminProducts, useDeleteProduct } from '../model/useAdminProducts'
import type { AdminProduct } from '../model/types'

const TYPE_LABELS: Record<AdminProduct['type'], string> = {
  vinyl: 'Винил',
  cd: 'CD',
  equipment: 'Оборудование',
}

interface ProductsTabProps {
  onEditProduct: (product: AdminProduct) => void
}

export function ProductsTab({ onEditProduct }: ProductsTabProps) {
  const products = useAdminProducts()
  const deleteProduct = useDeleteProduct()
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null)

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteProduct.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) })
  }

  // The whole catalog is already in memory (one request) — "infinite scroll"
  // here is purely how many of it get rendered. Fires repeatedly as the
  // sentinel scrolls in/out (once: false), revealing another chunk each pass
  // near the bottom until everything fetched is shown.
  const CHUNK_SIZE = 8
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE)
  const allItems = products.data ?? []
  const hasMore = visibleCount < allItems.length

  const { ref: sentinelRef, inView: sentinelInView } = useInView<HTMLDivElement>({
    once: false,
    threshold: 0,
    rootMargin: '400px 0px',
  })

  useEffect(() => {
    if (sentinelInView && hasMore) {
      setVisibleCount((count) => Math.min(count + CHUNK_SIZE, allItems.length))
    }
  }, [sentinelInView, hasMore, allItems.length])

  if (products.isLoading) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (products.isError) {
    return <Alert severity="error">Не удалось загрузить товары</Alert>
  }

  const items = allItems.slice(0, visibleCount)

  return (
    <>
      <Box
        sx={{
          overflowX: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 16px rgba(23,20,15,0.05)',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 600, color: 'text.secondary', border: 0 } }}>
              <TableCell>Обложка</TableCell>
              <TableCell>Товар</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Жанр</TableCell>
              <TableCell align="right">Цена</TableCell>
              <TableCell align="right">Остаток</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((product) => (
              <TableRow
                key={product.id}
                onClick={() => onEditProduct(product)}
                sx={{
                  cursor: 'pointer',
                  transition: 'background-color 200ms ease',
                  '&:hover': { bgcolor: 'rgba(140,47,39,0.05)' },
                  '&:last-of-type .MuiTableCell-root': { border: 0 },
                }}
              >
                <TableCell>
                  <Avatar variant="rounded" src={resolveAssetUrl(product.cover_url) ?? undefined} sx={{ width: 40, height: 40, borderRadius: 2 }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.artist}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.title}
                  </Typography>
                </TableCell>
                <TableCell>{TYPE_LABELS[product.type]}</TableCell>
                <TableCell>{product.genre?.name ?? '—'}</TableCell>
                <TableCell align="right">{product.price} ₽</TableCell>
                <TableCell align="right">{product.stock}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPendingDelete(product)
                    }}
                    aria-label="Удалить"
                    sx={{
                      borderRadius: 999,
                      transition: 'background-color 200ms ease, color 200ms ease',
                      '&:hover': { bgcolor: 'rgba(140,47,39,0.1)', color: '#8C2F27' },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {items.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Товаров пока нет
          </Typography>
        )}

        {hasMore && <Box ref={sentinelRef} sx={{ height: 1 }} />}
      </Box>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Удалить товар?"
        description={pendingDelete ? `«${pendingDelete.artist} — ${pendingDelete.title}» нельзя будет восстановить.` : undefined}
        loading={deleteProduct.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  )
}

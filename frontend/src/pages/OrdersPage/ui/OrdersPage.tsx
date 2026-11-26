import { Inventory2Outlined } from '@mui/icons-material'
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useCancelOrder, useOrders } from '@/entities/order'
import type { Order, OrderStatus } from '@/entities/order'
import { ApiError } from '@/shared/api/ApiError'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'

const CANCELLABLE_STATUSES: OrderStatus[] = ['new', 'processing']

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'В пути',
  completed: 'Завершён',
  cancelled: 'Отменён',
}

const STATUS_COLORS: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  new: 'info',
  processing: 'warning',
  shipped: 'info',
  completed: 'success',
  cancelled: 'error',
}

function formatMoney(value: string): string {
  return Number(value).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function OrdersPage() {
  const orders = useOrders()

  return (
    <Stack sx={{ minHeight: '100vh' }}>
      <Header />

      <Reveal>
        <Stack spacing={4} sx={{ px: { xs: 3, md: 8 }, py: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Мои заказы
          </Typography>

          {orders.isLoading ? (
            <Stack sx={{ alignItems: 'center', py: 10 }}>
              <CircularProgress />
            </Stack>
          ) : orders.isError ? (
            <Alert severity="error">Не удалось загрузить заказы</Alert>
          ) : orders.data && orders.data.length > 0 ? (
            <Stack spacing={3} sx={{ maxWidth: 720 }}>
              {orders.data.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </Stack>
          ) : (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '40vh', textAlign: 'center' }} spacing={1.5}>
              <Inventory2Outlined sx={{ fontSize: 40, color: 'divider' }} />
              <Typography sx={{ fontWeight: 600 }}>Заказов пока нет</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
                Оформите первый заказ из корзины — он появится здесь.
              </Typography>
              <Button component={RouterLink} to="/catalog" variant="outlined" sx={{ mt: 1, borderRadius: 999 }}>
                В каталог
              </Button>
            </Stack>
          )}
        </Stack>
      </Reveal>

      <Footer />
    </Stack>
  )
}

function OrderCard({ order }: { order: Order }) {
  const cancelOrder = useCancelOrder()
  const [confirming, setConfirming] = useState(false)

  const errorMessage = cancelOrder.error instanceof ApiError ? cancelOrder.error.message : null
  const canCancel = CANCELLABLE_STATUSES.includes(order.status)

  const handleCancel = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    cancelOrder.mutate(order.id, { onSuccess: () => setConfirming(false) })
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 16px rgba(23,20,15,0.05)',
        p: 3,
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Stack>
          <Typography sx={{ fontWeight: 700 }}>Заказ №{order.id}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(order.created_at)}
          </Typography>
        </Stack>
        <Chip label={STATUS_LABELS[order.status]} color={STATUS_COLORS[order.status]} size="small" />
      </Stack>

      <Stack spacing={0.5} sx={{ mb: 2 }}>
        {order.items.map((item, i) => (
          <Stack key={i} direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }} noWrap>
              {item.title_snapshot} × {item.quantity}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {formatMoney((Number(item.price_snapshot) * item.quantity).toFixed(2))} ₽
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'baseline', pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="body2" color="text.secondary">
          {order.address} · {order.phone}
        </Typography>
        <Typography sx={{ fontWeight: 700 }}>{formatMoney(order.total)} ₽</Typography>
      </Stack>

      {canCancel && (
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
          {confirming && (
            <Button size="small" onClick={() => setConfirming(false)} disabled={cancelOrder.isPending}>
              Передумала
            </Button>
          )}
          <Button
            size="small"
            color="error"
            variant={confirming ? 'contained' : 'outlined'}
            loading={cancelOrder.isPending}
            onClick={handleCancel}
          >
            {confirming ? 'Точно отменить?' : 'Отменить заказ'}
          </Button>
        </Stack>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}
    </Box>
  )
}

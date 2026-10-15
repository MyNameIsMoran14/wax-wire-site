import {
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useAdminOrders, useUpdateOrderStatus } from '../model/useAdminOrders'
import type { AdminOrder, OrderStatus } from '../model/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'В пути',
  completed: 'Завершён',
  cancelled: 'Отменён',
}

const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as OrderStatus[]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface OrdersTabProps {
  statusFilter?: OrderStatus
}

export function OrdersTab({ statusFilter }: OrdersTabProps) {
  const orders = useAdminOrders(statusFilter)

  if (orders.isLoading) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (orders.isError) {
    return <Alert severity="error">Не удалось загрузить заказы</Alert>
  }

  const items = orders.data ?? []

  return (
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
            <TableCell>Заказ</TableCell>
            <TableCell>Клиент</TableCell>
            <TableCell>Товары</TableCell>
            <TableCell align="right">Сумма</TableCell>
            <TableCell>Статус</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </TableBody>
      </Table>

      {items.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          Заказов пока нет
        </Typography>
      )}
    </Box>
  )
}

function OrderRow({ order }: { order: AdminOrder }) {
  const updateStatus = useUpdateOrderStatus()
  const itemsSummary = order.items.map((item) => `${item.title_snapshot} ×${item.quantity}`).join(', ')

  // The Select is controlled by the query cache value, which only updates
  // after the PATCH round-trips and the list refetches — without this, every
  // status change visually snaps back to the old value for a moment (looks
  // like the click didn't register) before jumping to the new one.
  // `pendingStatus` shows the picked value immediately and clears itself
  // once the real order.status catches up, or on error (revert).
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)
  const displayStatus = pendingStatus ?? order.status

  useEffect(() => {
    if (pendingStatus !== null && order.status === pendingStatus) {
      setPendingStatus(null)
    }
  }, [order.status, pendingStatus])

  const handleChange = (e: SelectChangeEvent) => {
    const next = e.target.value as OrderStatus
    setPendingStatus(next)
    updateStatus.mutate(
      { id: order.id, status: next },
      { onError: () => setPendingStatus(null) },
    )
  }

  return (
    <TableRow sx={{ '&:last-of-type .MuiTableCell-root': { border: 0 } }}>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          №{order.id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(order.created_at)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {order.user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {order.user.email}
        </Typography>
      </TableCell>
      <TableCell sx={{ maxWidth: 280 }}>
        <Typography variant="body2" color="text.secondary" noWrap title={itemsSummary}>
          {itemsSummary}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
          {Number(order.total).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
        </Typography>
      </TableCell>
      <TableCell>
        <Select
          size="small"
          value={displayStatus}
          onChange={handleChange}
          sx={{ minWidth: 150, borderRadius: 999, '& .MuiOutlinedInput-notchedOutline': { borderRadius: 999 } }}
        >
          {STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </MenuItem>
          ))}
        </Select>
      </TableCell>
    </TableRow>
  )
}

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

// Styled stand-in for window.confirm() — the native dialog can't be themed
// and shows the raw origin ("Подтвердите действие на 127.0.0.1:5173"), which
// looks broken next to the rest of the site.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      {description && (
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 3, pt: description ? 0 : 3 }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius: 999 }}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          loading={loading}
          sx={{
            borderRadius: 999,
            px: 3,
            bgcolor: '#8C2F27',
            '&:hover': { bgcolor: '#8C2F27' },
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

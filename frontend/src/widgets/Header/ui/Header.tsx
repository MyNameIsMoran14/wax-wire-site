import { KeyboardArrowDown } from '@mui/icons-material'
import { AppBar, Avatar, Badge, Button, InputBase, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material'
import { type FormEvent, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/entities/cart'
import { useFavoriteStore } from '@/entities/favorite'
import { useAuthStore } from '@/entities/user'

const NAV_LINKS = [
  { label: 'Каталог', to: '/catalog' },
  { label: 'Новинки', to: '/catalog' },
  { label: 'FAQ' },
  { label: 'Как заказать' },
] as const

export function Header() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const favoriteCount = useFavoriteStore((s) => s.ids.size)
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0))

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : '/catalog')
  }

  const handleLogout = () => {
    setMenuAnchor(null)
    clearAuth()
  }

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        top: 0,
        zIndex: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 8 }, py: 1.5, gap: 6 }}>
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{ fontWeight: 900, textDecoration: 'none', color: 'text.primary', whiteSpace: 'nowrap' }}
        >
          WAX & WIRE.
        </Typography>

        <Stack direction="row" spacing={4} sx={{ flexGrow: 1, alignItems: 'center' }}>
          {NAV_LINKS.map((link) =>
            'to' in link ? (
              <Button key={link.label} component={RouterLink} to={link.to} color="inherit">
                {link.label}
              </Button>
            ) : (
              <Button key={link.label} color="inherit">
                {link.label}
              </Button>
            ),
          )}
        </Stack>

        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          {/* Global quick-search: Enter takes you to the catalog with the
              query pre-filled. The catalog's own search field is for
              refining a list you're already looking at — this one is for
              jumping there from anywhere (home, product page, etc). */}
          <Stack
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ display: { xs: 'none', lg: 'block' } }}
          >
            <InputBase
              placeholder="Поиск пластинок…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{
                bgcolor: 'background.default',
                borderRadius: 999,
                px: 2,
                py: 0.75,
                fontSize: 14,
                width: 220,
              }}
            />
          </Stack>

          <Badge
            badgeContent={favoriteCount}
            color="primary"
            sx={{ display: { xs: 'none', sm: 'inline-flex' }, '& .MuiBadge-badge': { right: -10, top: 2 } }}
          >
            <Button color="inherit" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              Избранное
            </Button>
          </Badge>

          <Badge
            badgeContent={cartCount}
            color="primary"
            sx={{ '& .MuiBadge-badge': { right: -10, top: 2 } }}
          >
            <Button color="inherit">Корзина</Button>
          </Badge>

          {user ? (
            <>
              <Stack
                direction="row"
                spacing={1}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: 999,
                  pl: 0.5,
                  pr: 1.25,
                  py: 0.5,
                  transition: 'background-color 300ms ease',
                  '&:hover': { bgcolor: 'background.default' },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: 14,
                    fontWeight: 700,
                    border: '2px solid',
                    borderColor: 'background.paper',
                    boxShadow: '0 0 0 1px rgba(140,47,39,0.25)',
                  }}
                >
                  {user.name.trim().charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
                  {user.name}
                </Typography>
                <KeyboardArrowDown
                  fontSize="small"
                  sx={{
                    color: 'text.secondary',
                    transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                    transform: menuAnchor ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </Stack>
              <Menu
                anchorEl={menuAnchor}
                open={menuAnchor !== null}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1.5,
                      minWidth: 180,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 16px 40px rgba(23,20,15,0.18)',
                    },
                  },
                  list: { sx: { p: 1 } },
                }}
              >
                {user.role === 'admin' && (
                  <MenuItem
                    component={RouterLink}
                    to="/admin"
                    onClick={() => setMenuAnchor(null)}
                    sx={{
                      borderRadius: 1.5,
                      fontWeight: 500,
                      transition: 'background-color 300ms ease, color 300ms ease',
                      '&:hover': { bgcolor: 'rgba(140,47,39,0.08)', color: '#8C2F27' },
                    }}
                  >
                    Админ-панель
                  </MenuItem>
                )}
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 1.5,
                    fontWeight: 500,
                    transition: 'background-color 300ms ease, color 300ms ease',
                    '&:hover': { bgcolor: 'rgba(140,47,39,0.08)', color: '#8C2F27' },
                  }}
                >
                  Выйти
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={RouterLink} to="/login" variant="outlined" sx={{ borderRadius: 999 }}>
              Войти
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

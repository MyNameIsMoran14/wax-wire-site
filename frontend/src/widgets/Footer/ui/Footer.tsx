import { Box, Link as MuiLink, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const LINK_COLUMNS = [
  { title: 'Каталог', links: ['Новинки', 'Пластинки', 'Оборудование', 'Аксессуары'] },
  { title: 'Помощь', links: ['FAQ', 'Доставка', 'Оплата', 'Контакты'] },
  { title: 'О магазине', links: ['О нас', 'Блог', 'Вакансии'] },
] as const

export function Footer() {
  return (
    <Box component="footer" sx={{ position: 'relative', bgcolor: '#17140F', color: '#F7F3EC', px: { xs: 3, md: 8 }, pt: 8, pb: 4 }}>
      {/* Brand: normal flow, flush at the same left edge as Header. Untouched
          by wherever the columns end up. */}
      <Stack spacing={1.5} sx={{ maxWidth: 280 }}>
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{
            fontWeight: 900,
            color: 'inherit',
            textDecoration: 'none',
            width: 'fit-content',
            transition: 'color 550ms cubic-bezier(0.22, 1, 0.36, 1)',
            '&:hover': { color: '#8C2F27' },
          }}
        >
          WAX & WIRE.
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>
          Магазин виниловых пластинок и оборудования в Ростове-на-Дону
        </Typography>
      </Stack>

      {/* Columns: independently centered on the true page width (md+), via
          position:absolute + left:50% off the footer's own box — NOT
          computed relative to the brand block above. Falls back to normal
          stacked flow on mobile. */}
      <Box
        sx={{
          mt: { xs: 6, md: 0 },
          display: 'flex',
          justifyContent: 'center',
          position: { md: 'absolute' },
          top: { md: 64 },
          left: { md: '50%' },
          transform: { md: 'translateX(-50%)' },
        }}
      >
        <Stack direction="row" spacing={{ xs: 4, sm: 8 }} sx={{ flexWrap: 'wrap', rowGap: 4 }}>
          {LINK_COLUMNS.map((column) => (
            <Stack key={column.title} spacing={1.5}>
              <Typography variant="body2" sx={{ opacity: 0.6, fontWeight: 600 }}>
                {column.title}
              </Typography>
              {column.links.map((label) => (
                <MuiLink
                  key={label}
                  component="button"
                  type="button"
                  underline="none"
                  sx={{
                    display: 'block',
                    color: 'inherit',
                    textAlign: 'left',
                    fontSize: 14,
                    opacity: 0.85,
                    fontFamily: 'inherit',
                    transition: 'color 550ms cubic-bezier(0.22, 1, 0.36, 1)',
                    '&:hover': { color: '#8C2F27' },
                  }}
                >
                  {label}
                </MuiLink>
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Columns are position:absolute (out of flow) and taller than the
          brand block, so the divider needs extra top margin on desktop to
          clear them — just enough, not a big empty spacer. */}
      <Box sx={{ borderTop: '1px solid rgba(247,243,236,0.15)', mt: { xs: 6, md: 12 }, pt: 3 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.5 }}>
            © 2026 Wax &amp; Wire
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.5 }}>
            RU / EN
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}

import { Box, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const LINK_COLUMNS = [
  { title: 'Каталог', links: ['Новинки', 'Пластинки', 'Оборудование', 'Аксессуары'] },
  { title: 'Помощь', links: ['FAQ', 'Доставка', 'Оплата', 'Контакты'] },
  { title: 'О магазине', links: ['О нас', 'Блог', 'Вакансии'] },
] as const

export function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#17140F', color: '#F7F3EC', px: { xs: 3, md: 8 }, pt: 8, pb: 4 }}>
      {/* Brand and columns share one grid row instead of columns being
          position:absolute — both stay in normal flow, so the row's height
          is always the taller of the two automatically (no more manual
          top/margin pixel values that break when a column gains a link or
          text wraps). The empty 3rd track mirrors track 1 so track 2 (the
          columns) lands in the grid's true center — independent of the
          brand's own width, same axis as the hero CTA button above. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
          columnGap: 4,
          rowGap: 6,
        }}
      >
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

        <Stack direction="row" spacing={{ xs: 4, sm: 8 }} sx={{ flexWrap: 'wrap', rowGap: 4, justifySelf: { md: 'center' } }}>
          {LINK_COLUMNS.map((column) => (
            <Stack key={column.title} spacing={1.5}>
              <Typography variant="body2" sx={{ opacity: 0.6, fontWeight: 600 }}>
                {column.title}
              </Typography>
              {column.links.map((label) => (
                // Plain (non-interactive) text on purpose: these pages don't
                // exist yet. A focusable <button> with no onClick would be a
                // dead stop for keyboard/screen-reader users — worse than an
                // honest placeholder. Swap to a real <Link> once each page ships.
                <Typography
                  key={label}
                  variant="body2"
                  sx={{
                    color: 'inherit',
                    opacity: 0.85,
                    transition: 'color 550ms cubic-bezier(0.22, 1, 0.36, 1)',
                    '&:hover': { color: '#8C2F27' },
                  }}
                >
                  {label}
                </Typography>
              ))}
            </Stack>
          ))}
        </Stack>

        <Box sx={{ display: { xs: 'none', md: 'block' } }} />
      </Box>

      <Box sx={{ borderTop: '1px solid rgba(247,243,236,0.15)', mt: 6, pt: 3 }}>
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

import { Box, Button, Fade, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAppReadyStore } from '@/shared/lib/appReadyStore'
import { Reveal } from '@/shared/ui/Reveal'
import { VinylRecord } from '@/shared/ui/VinylRecord'
import { Header } from '@/widgets/Header'

const CATEGORIES = [
  { label: '/ эксклюзивные издания' },
  { label: '/ лимитированные альбомы' },
  { label: '/ лучшие исполнители всех времён' },
]

// Staggered entrance: each hero element gets a growing delay so the page
// reveals top-to-bottom instead of popping in all at once. Gated on
// appReady (splash fully finished), not on this component's own mount.
function delayStyle(mounted: boolean, ms: number) {
  return { transitionDelay: mounted ? `${ms}ms` : '0ms' }
}

export function HomePage() {
  const mounted = useAppReadyStore((s) => s.ready)

  return (
    <Stack>
      <Header />

      <Stack sx={{ alignItems: 'center', pt: 2, pb: 8, px: 3, overflow: 'visible' }}>
        <Fade in={mounted} timeout={900} style={delayStyle(mounted, 100)}>
          <Box sx={{ position: 'relative', zIndex: 1, mt: '-330px', mb: '-32px' }}>
            <VinylRecord size={740} />
          </Box>
        </Fade>

        <Fade in={mounted} timeout={900} style={delayStyle(mounted, 250)}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 1100 }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 56, md: 96 }, color: 'primary.main', lineHeight: 1 }}>
              WAX
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 56, md: 96 }, color: 'primary.main', lineHeight: 1 }}>
              WIRE
            </Typography>
          </Stack>
        </Fade>

        <Fade in={mounted} timeout={900} style={delayStyle(mounted, 400)}>
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              letterSpacing: 4,
              fontWeight: 600,
              color: 'primary.main',
              textAlign: 'center',
              whiteSpace: 'pre-line',
            }}
          >
            {'МАГАЗИН ВИНИЛОВЫХ ПЛАСТИНОК\nВ РОСТОВЕ-НА-ДОНУ'}
          </Typography>
        </Fade>

        <Fade in={mounted} timeout={900} style={delayStyle(mounted, 550)}>
          <Button
            component={RouterLink}
            to="/catalog"
            variant="contained"
            size="large"
            sx={{ mt: 3, borderRadius: 999, px: 4 }}
          >
            В каталог
          </Button>
        </Fade>
      </Stack>

      <Stack
        direction="row"
        spacing={4}
        sx={{ px: { xs: 3, md: 8 }, pb: 10, justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {CATEGORIES.map((category, i) => (
          <Reveal key={category.label} delay={i * 120}>
            <Stack spacing={1.5} sx={{ width: 260 }}>
              <Box sx={{ width: '100%', aspectRatio: '4 / 3', bgcolor: 'divider', borderRadius: 0.5 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {category.label}
              </Typography>
            </Stack>
          </Reveal>
        ))}
      </Stack>
    </Stack>
  )
}

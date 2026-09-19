import { Box, Button, Grow, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Reveal } from '@/shared/ui/Reveal'
import { VinylRecord } from '@/shared/ui/VinylRecord'
import { Header } from '@/widgets/Header'

const CATEGORIES = [
  { label: '/ эксклюзивные издания' },
  { label: '/ лимитированные альбомы' },
  { label: '/ лучшие исполнители всех времён' },
]

// Staggered entrance: each hero element gets a growing delay so the page
// reveals top-to-bottom instead of popping in all at once.
function delayStyle(mounted: boolean, ms: number) {
  return { transitionDelay: mounted ? `${ms}ms` : '0ms' }
}

export function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Stack>
      <Header />

      <Stack sx={{ alignItems: 'center', pt: 2, pb: 8, px: 3, overflow: 'visible' }}>
        <Grow in={mounted} timeout={700}>
          <Box sx={{ position: 'relative', zIndex: 1, mt: '-250px', mb: '-28px' }}>
            <VinylRecord size={560} />
          </Box>
        </Grow>

        <Grow in={mounted} timeout={700} style={delayStyle(mounted, 150)}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 1100 }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 56, md: 96 }, color: 'primary.main', lineHeight: 1 }}>
              VINYL
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 56, md: 96 }, color: 'primary.main', lineHeight: 1 }}>
              SHOP
            </Typography>
          </Stack>
        </Grow>

        <Grow in={mounted} timeout={700} style={delayStyle(mounted, 300)}>
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
            {'МАГАЗИН ВИНИЛОВЫХ ПЛАСТИНОК\nВ МОСКВЕ'}
          </Typography>
        </Grow>

        <Grow in={mounted} timeout={700} style={delayStyle(mounted, 450)}>
          <Button
            component={RouterLink}
            to="/catalog"
            variant="contained"
            size="large"
            sx={{ mt: 3, borderRadius: 999, px: 4 }}
          >
            В каталог
          </Button>
        </Grow>
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

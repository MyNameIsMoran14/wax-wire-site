import { Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { Reveal } from '@/shared/ui/Reveal'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <Stack>
      <Header />
      <Reveal>
        <Stack sx={{ alignItems: 'center', py: 12, px: 3, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Товар #{id} в разработке
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Обложка, треклист и «в корзину»/«в избранное» появятся здесь следующим шагом.
          </Typography>
        </Stack>
      </Reveal>
      <Footer />
    </Stack>
  )
}

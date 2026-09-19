import { Box, Fade } from '@mui/material'
import { VinylRecord } from '@/shared/ui/VinylRecord'

interface SplashScreenProps {
  in: boolean
}

// Full-screen spinning record shown while the app bootstraps (auth check etc).
// Fades out on its own once `in` flips to false — the caller decides when.
export function SplashScreen({ in: visible }: SplashScreenProps) {
  return (
    <Fade in={visible} unmountOnExit timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <VinylRecord size={220} />
      </Box>
    </Fade>
  )
}

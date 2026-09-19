import { Box, Fade } from '@mui/material'
import { VinylRecord } from '@/shared/ui/VinylRecord'

interface SplashScreenProps {
  in: boolean
}

export const SPLASH_EXIT_MS = 700
const EXIT_MS = SPLASH_EXIT_MS

// Full-screen spinning record shown while the app bootstraps (auth check etc).
// On exit the record grows and fades out together, then the page underneath
// is revealed — the caller decides when `in` flips to false.
export function SplashScreen({ in: visible }: SplashScreenProps) {
  return (
    <Fade in={visible} unmountOnExit timeout={{ enter: 400, exit: EXIT_MS }}>
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
        <Box
          sx={{
            transition: `transform ${EXIT_MS}ms cubic-bezier(.4,0,.2,1)`,
            transform: visible ? 'scale(1)' : 'scale(2.6)',
          }}
        >
          <VinylRecord size={220} />
        </Box>
      </Box>
    </Fade>
  )
}

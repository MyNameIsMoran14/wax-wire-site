import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material'
import type { ReactNode } from 'react'

const theme = createTheme({
  palette: {
    primary: { main: '#8C2F27' },
    background: { default: '#F7F3EC', paper: '#FFFFFF' },
    text: { primary: '#17140F', secondary: '#5C564D' },
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
  },
  shape: { borderRadius: 4 },
  components: {
    // CssBaseline colors `body`'s background but leaves `html` alone — on a
    // page shorter than the viewport, the area below `body`'s content isn't
    // guaranteed to inherit that color (browser-dependent), so a resize or a
    // content-height change (e.g. an admin panel selection collapsing) can
    // flash raw white beneath the footer. Coloring `html` too closes that gap.
    MuiCssBaseline: {
      styleOverrides: {
        html: { backgroundColor: '#F7F3EC' },
      },
    },
    MuiButton: {
      styleOverrides: {
        // Hover swaps the two styles: filled -> outline, outline -> filled.
        // MUI dropped the combined `containedPrimary`/`outlinedPrimary` classes,
        // so variant+color is matched by hand via ownerState instead.
        root: ({ ownerState }) => {
          // Nav-style text buttons (e.g. "Каталог", "Новинки"): no hover
          // background pill, just the text turning brand burgundy.
          if (ownerState.variant === 'text') {
            return {
              transition: 'color 550ms cubic-bezier(0.22, 1, 0.36, 1)',
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#8C2F27',
              },
            }
          }

          const isPrimary = !ownerState.color || ownerState.color === 'primary'
          if (!isPrimary) return {}

          if (ownerState.variant === 'contained') {
            return {
              border: '1px solid transparent',
              transition:
                'background-color 550ms cubic-bezier(0.22, 1, 0.36, 1), color 550ms cubic-bezier(0.22, 1, 0.36, 1), border-color 550ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 550ms cubic-bezier(0.22, 1, 0.36, 1)',
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#8C2F27',
                borderColor: '#8C2F27',
                boxShadow: '0 4px 20px rgba(140, 47, 39, 0.25)',
              },
            }
          }
          if (ownerState.variant === 'outlined') {
            return {
              transition:
                'background-color 550ms cubic-bezier(0.22, 1, 0.36, 1), color 550ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 550ms cubic-bezier(0.22, 1, 0.36, 1)',
              '&:hover': {
                backgroundColor: '#8C2F27',
                color: '#F7F3EC',
                boxShadow: '0 4px 20px rgba(140, 47, 39, 0.25)',
              },
            }
          }
          return {}
        },
      },
    },
  },
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

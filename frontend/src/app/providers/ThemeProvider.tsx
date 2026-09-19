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
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

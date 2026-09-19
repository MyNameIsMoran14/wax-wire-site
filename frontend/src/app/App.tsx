import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import { QueryProvider } from './providers/QueryProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { router } from './providers/router'

export function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

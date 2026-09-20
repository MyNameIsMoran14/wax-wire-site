import { createBrowserRouter } from 'react-router-dom'
import { CatalogPage } from '@/pages/CatalogPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { AuthLayout } from '@/widgets/AuthLayout'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/catalog/:id', element: <ProductDetailPage /> },
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
])

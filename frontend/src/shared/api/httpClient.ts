import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/shared/config/env'
import { ApiError } from './ApiError'
import { notifyUnauthorized, tokenStorage } from './tokenStorage'

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const client = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true, // отправлять httpOnly refresh-cookie
  headers: { 'Content-Type': 'application/json' },
})

// Request-интерцептор — подставляет Bearer-токен в каждый запрос.
client.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string }>(`${env.apiUrl}/auth/refresh`, undefined, { withCredentials: true })
      .then((res) => {
        tokenStorage.set(res.data.accessToken)
        return res.data.accessToken
      })
      .catch(() => {
        tokenStorage.set(null)
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0
  const payload = error.response?.data as { error?: { code: string; message: string } } | undefined
  const message = payload?.error?.message ?? error.message
  return new ApiError(status, message, payload)
}

// Response-интерцептор — молча обновляет токен по 401 и повторяет запрос один раз.
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined

    if (error.response?.status === 401 && original && !original._retry && original.url !== '/auth/refresh') {
      const newToken = await refreshAccessToken()
      if (newToken) {
        original._retry = true
        original.headers.Authorization = `Bearer ${newToken}`
        return client(original)
      }
      notifyUnauthorized()
    }

    return Promise.reject(toApiError(error))
  },
)

export const httpClient = {
  get: <T>(path: string) => client.get<T>(path).then((res) => res.data),
  post: <T>(path: string, body?: unknown) => client.post<T>(path, body).then((res) => res.data),
  patch: <T>(path: string, body?: unknown) => client.patch<T>(path, body).then((res) => res.data),
  delete: <T>(path: string) => client.delete<T>(path).then((res) => res.data),
}

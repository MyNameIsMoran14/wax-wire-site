import { env } from '@/shared/config/env'
import { ApiError } from './ApiError'
import { notifyUnauthorized, tokenStorage } from './tokenStorage'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: Method
  body?: unknown
  skipAuthRetry?: boolean
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${env.apiUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        if (!res.ok) {
          tokenStorage.set(null)
          return null
        }
        const data = (await res.json()) as { accessToken: string }
        tokenStorage.set(data.accessToken)
        return data.accessToken
      } catch {
        tokenStorage.set(null)
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuthRetry = false } = options

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = tokenStorage.get()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${env.apiUrl}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && !skipAuthRetry && path !== '/auth/refresh') {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return request<T>(path, { ...options, skipAuthRetry: true })
    }
    notifyUnauthorized()
    throw new ApiError(401, 'Unauthorized')
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json().catch(() => undefined) : undefined

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${res.status}`
    throw new ApiError(res.status, message, payload)
  }

  return payload as T
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

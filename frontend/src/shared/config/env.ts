export const env = {
  // Must match the frontend's own host exactly (127.0.0.1, not localhost) —
  // the refresh cookie is SameSite=Lax, and browsers treat 127.0.0.1/localhost
  // as different sites even though they resolve to the same machine.
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1',
} as const

// Product cover_url etc. come back as origin-relative paths (e.g.
// "/uploads/covers/9-abc.jpg"), not full URLs — they're static files served
// by the backend, not part of the /api/v1 surface. Resolving against apiUrl
// with a leading slash correctly drops the "/api/v1" suffix and keeps just the origin.
export function resolveAssetUrl(path: string | null): string | null {
  return path ? new URL(path, env.apiUrl).href : null
}

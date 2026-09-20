export const env = {
  // Must match the frontend's own host exactly (127.0.0.1, not localhost) —
  // the refresh cookie is SameSite=Lax, and browsers treat 127.0.0.1/localhost
  // as different sites even though they resolve to the same machine.
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1',
} as const

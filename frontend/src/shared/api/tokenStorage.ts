// In-memory access token storage. Lives in `shared` (no upward FSD deps) so
// entities/user can push tokens into it and app/providers can react to
// unauthorized events without shared/api depending on entities/user.

let accessToken: string | null = null
let unauthorizedHandler: (() => void) | null = null

export const tokenStorage = {
  get(): string | null {
    return accessToken
  },
  set(token: string | null): void {
    accessToken = token
  },
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.()
}

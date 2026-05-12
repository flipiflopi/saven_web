const COOKIE_NAME = 'saven_admin'

export function getAdminToken(): string {
  const pwd = process.env.ADMIN_PASSWORD ?? ''
  return Buffer.from(`${pwd}:saven-admin`).toString('base64')
}

export function isValidAdminSession(cookieValue: string | undefined): boolean {
  if (!cookieValue || !process.env.ADMIN_PASSWORD) return false
  return cookieValue === getAdminToken()
}

export { COOKIE_NAME }

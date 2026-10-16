import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { MOCK_ADMIN } from '@/data/store'

const SESSION_COOKIE_NAME = 'admin-session'
const ADMIN_ID_COOKIE_NAME = 'admin-id'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// bcrypt hash for the demo password can be provided via ADMIN_PASSWORD_HASH.
// Otherwise (demo setup only) credentials fall back to a timing-safe
// plaintext comparison against the demo admin in the store.

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.includes('change-this')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET must be set to a strong random value in production')
    }
    return 'dev-only-secret-do-not-use-in-production'
  }
  return secret
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  if (email !== MOCK_ADMIN.email) return false
  // If a custom hash is configured use it, otherwise fall back to a
  // timing-safe demo comparison (demo setup only).
  if (process.env.ADMIN_PASSWORD_HASH) {
    return verifyPassword(password, process.env.ADMIN_PASSWORD_HASH)
  }
  const a = Buffer.from(password)
  const b = Buffer.from(MOCK_ADMIN.password)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

function sign(value: string): string {
  return crypto.createHmac('sha256', getAuthSecret()).update(value).digest('hex')
}

export async function createSession(adminId: string) {
  const expiresAt = Date.now() + SESSION_DURATION
  const payload = `${adminId}.${expiresAt}`
  const sessionToken = `${payload}.${sign(payload)}`

  const cookieStore = await cookies()
  const secure = process.env.NODE_ENV === 'production'
  const expires = new Date(expiresAt)
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure,
    expires,
    sameSite: 'lax',
    path: '/',
  })

  cookieStore.set(ADMIN_ID_COOKIE_NAME, adminId, {
    httpOnly: true,
    secure,
    expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const adminId = cookieStore.get(ADMIN_ID_COOKIE_NAME)?.value

  if (!sessionToken || !adminId) {
    return null
  }

  const parts = sessionToken.split('.')
  if (parts.length !== 3) return null
  const [tokenAdminId, expiresRaw, signature] = parts
  if (tokenAdminId !== adminId || tokenAdminId !== MOCK_ADMIN.id) return null

  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || Date.now() > expires) return null

  const expected = sign(`${tokenAdminId}.${expiresRaw}`)
  const sigBuf = Buffer.from(signature, 'hex')
  const expBuf = Buffer.from(expected, 'hex')
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null
  }

  return {
    id: MOCK_ADMIN.id,
    name: MOCK_ADMIN.name,
    email: MOCK_ADMIN.email,
    role: MOCK_ADMIN.role,
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(ADMIN_ID_COOKIE_NAME)
}

export function isAuthenticatedRequest(sessionToken: string | undefined, adminId: string | undefined): boolean {
  if (!sessionToken || !adminId || adminId !== MOCK_ADMIN.id) return false
  const parts = sessionToken.split('.')
  if (parts.length !== 3) return false
  const [tokenAdminId, expiresRaw, signature] = parts
  if (tokenAdminId !== adminId) return false
  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || Date.now() > expires) return false
  try {
    const expected = sign(`${tokenAdminId}.${expiresRaw}`)
    const sigBuf = Buffer.from(signature, 'hex')
    const expBuf = Buffer.from(expected, 'hex')
    return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)
  } catch {
    return false
  }
}

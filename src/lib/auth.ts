import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE_NAME = 'admin-session'
const ADMIN_ID_COOKIE_NAME = 'admin-id'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

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

export async function verifyAdminCredentials(email: string, password: string): Promise<{ id: string; name: string; email: string; role: string } | null> {
  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user || !user.active) {
    return null
  }

  const valid = await verifyPassword(password, user.password)
  if (!valid) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
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
  if (tokenAdminId !== adminId) return null

  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || Date.now() > expires) return null

  const expected = sign(`${tokenAdminId}.${expiresRaw}`)
  const sigBuf = Buffer.from(signature, 'hex')
  const expBuf = Buffer.from(expected, 'hex')
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null
  }

  // Verify user still exists and is active
  const user = await prisma.adminUser.findUnique({
    where: { id: tokenAdminId },
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  if (!user || !user.active) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(ADMIN_ID_COOKIE_NAME)
}

export function isAuthenticatedRequest(sessionToken: string | undefined, adminId: string | undefined): boolean {
  if (!sessionToken || !adminId) return false
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
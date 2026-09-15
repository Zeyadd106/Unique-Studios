import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { MOCK_ADMIN } from '@/data/store'

const SESSION_COOKIE_NAME = 'admin-session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(adminId: string) {
  const sessionToken = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })

  // DB-free setup: the session references the demo admin id.
  cookieStore.set('admin-id', adminId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)
  const adminId = cookieStore.get('admin-id')

  if (!sessionToken || !adminId) {
    return null
  }

  if (adminId.value !== MOCK_ADMIN.id) {
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
  cookieStore.delete('admin-id')
}

function generateSessionToken(): string {
  return Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')
}

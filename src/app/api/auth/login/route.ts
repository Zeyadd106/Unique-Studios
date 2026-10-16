import { NextResponse } from 'next/server'
import { MOCK_ADMIN } from '@/data/store'
import { createSession, verifyAdminCredentials } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const ok = await verifyAdminCredentials(email, password)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await createSession(MOCK_ADMIN.id)

    return NextResponse.json({
      success: true,
      admin: {
        id: MOCK_ADMIN.id,
        name: MOCK_ADMIN.name,
        email: MOCK_ADMIN.email,
        role: MOCK_ADMIN.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

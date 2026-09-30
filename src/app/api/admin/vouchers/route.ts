import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { VOUCHERS, createVoucher } from '@/data/store'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(VOUCHERS)
  } catch (error) {
    console.error('Error fetching vouchers:', error)
    return NextResponse.json({ error: 'Failed to fetch vouchers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, type, value, minSubtotal, active } = body

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }
    if (type !== 'percent' && type !== 'fixed') {
      return NextResponse.json({ error: 'Type must be percent or fixed' }, { status: 400 })
    }
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return NextResponse.json({ error: 'Value must be a positive number' }, { status: 400 })
    }
    if (type === 'percent' && numericValue > 90) {
      return NextResponse.json({ error: 'Percent discount cannot exceed 90%' }, { status: 400 })
    }

    const voucher = createVoucher({
      code,
      type,
      value: numericValue,
      minSubtotal: minSubtotal === null || minSubtotal === undefined || minSubtotal === '' ? null : Number(minSubtotal),
      active: active !== false,
    })

    return NextResponse.json(voucher)
  } catch (error) {
    console.error('Error creating voucher:', error)
    return NextResponse.json({ error: 'Failed to create voucher' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapVoucher, parseVoucherInput } from '@/lib/catalog'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(vouchers.map(mapVoucher))
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
    const parsed = parseVoucherInput(body)
    const discountType = parsed.discountType
    const discountValue = parsed.discountValue
    const minOrderAmount = parsed.minOrderAmount
    const code = String(body.code ?? '').trim()

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }
    if (discountType !== 'PERCENTAGE' && discountType !== 'FIXED') {
      return NextResponse.json({ error: 'discountType must be PERCENTAGE or FIXED' }, { status: 400 })
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return NextResponse.json({ error: 'discountValue must be a positive number' }, { status: 400 })
    }
    if (discountType === 'PERCENTAGE' && discountValue > 90) {
      return NextResponse.json({ error: 'Percentage discount cannot exceed 90%' }, { status: 400 })
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        description: body.description ?? null,
        discountType,
        discountValue,
        minOrderAmount: Number.isFinite(minOrderAmount) ? minOrderAmount : 0,
        maxUses: body.maxUses ?? null,
        active: body.active !== false,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    })

    return NextResponse.json(mapVoucher(voucher), { status: 201 })
  } catch (error) {
    console.error('Error creating voucher:', error)
    return NextResponse.json({ error: 'Failed to create voucher' }, { status: 500 })
  }
}

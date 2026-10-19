import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      vouchers.map((v) => ({
        id: v.id,
        code: v.code,
        description: v.description,
        discountType: v.discountType,
        discountValue: v.discountValue,
        minOrderAmount: v.minOrderAmount,
        maxUses: v.maxUses,
        usedCount: v.usedCount,
        startsAt: v.startsAt,
        expiresAt: v.expiresAt,
        active: v.active,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      }))
    )
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
    const { code, discountType, discountValue, minOrderAmount, active, maxUses, startsAt, expiresAt } = body

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }
    if (!['PERCENTAGE', 'FIXED'].includes(discountType)) {
      return NextResponse.json({ error: 'discountType must be PERCENTAGE or FIXED' }, { status: 400 })
    }
    const numericValue = Number(body.value)
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return NextResponse.json({ error: 'discountValue must be a positive number' }, { status: 400 })
    }
    if (discountType === 'PERCENTAGE' && numericValue > 90) {
      return NextResponse.json({ error: 'Percentage discount cannot exceed 90%' }, { status: 400 })
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.trim().toUpperCase(),
        description: body.description ?? null,
        discountType,
        discountValue: numericValue,
        minOrderAmount: body.minOrderAmount ?? 0,
        maxUses: body.maxUses ?? null,
        active: active !== false,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    })

    return NextResponse.json(voucher, { status: 201 })
  } catch (error) {
    console.error('Error creating voucher:', error)
    return NextResponse.json({ error: 'Failed to create voucher' }, { status: 500 })
  }
}
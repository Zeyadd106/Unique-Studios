import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapVoucher, parseVoucherInput } from '@/lib/catalog'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = parseVoucherInput(body)

    const data: {
      code?: string
      discountType?: 'PERCENTAGE' | 'FIXED'
      discountValue?: number
      minOrderAmount?: number
      maxUses?: number | null
      active?: boolean
      startsAt?: Date | null
      expiresAt?: Date | null
      description?: string | null
    } = {}

    if (body.code !== undefined) data.code = String(body.code).trim().toUpperCase()
    if (body.discountType !== undefined || body.type !== undefined) {
      const discountType = parsed.discountType
      if (discountType !== 'PERCENTAGE' && discountType !== 'FIXED') {
        return NextResponse.json({ error: 'discountType must be PERCENTAGE or FIXED' }, { status: 400 })
      }
      data.discountType = discountType
    }
    if (body.value !== undefined || body.discountValue !== undefined) {
      if (!Number.isFinite(parsed.discountValue) || parsed.discountValue <= 0) {
        return NextResponse.json({ error: 'discountValue must be a positive number' }, { status: 400 })
      }
      if (data.discountType === 'PERCENTAGE' && parsed.discountValue > 90) {
        return NextResponse.json({ error: 'Percentage discount cannot exceed 90%' }, { status: 400 })
      }
      data.discountValue = parsed.discountValue
    }
    if (body.minOrderAmount !== undefined || body.minSubtotal !== undefined) {
      data.minOrderAmount = Number.isFinite(parsed.minOrderAmount) ? parsed.minOrderAmount : 0
    }
    if (body.maxUses !== undefined) {
      data.maxUses = body.maxUses === null || body.maxUses === '' ? null : Number(body.maxUses)
    }
    if (body.active !== undefined) data.active = Boolean(body.active)
    if (body.description !== undefined) data.description = body.description ?? null
    if (body.startsAt !== undefined) {
      data.startsAt = body.startsAt ? new Date(body.startsAt) : null
    }
    if (body.expiresAt !== undefined) {
      data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    }

    const voucher = await prisma.voucher.update({
      where: { id },
      data,
    })

    return NextResponse.json(mapVoucher(voucher))
  } catch (error) {
    console.error('Error updating voucher:', error)
    return NextResponse.json({ error: 'Failed to update voucher' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.voucher.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting voucher:', error)
    return NextResponse.json({ error: 'Failed to delete voucher' }, { status: 500 })
  }
}

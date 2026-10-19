import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const data: {
      code?: string
      discountType?: 'PERCENTAGE' | 'FIXED'
      discountValue?: number
      minOrderAmount?: number
      maxUses?: number | null
      active?: boolean
      startsAt?: Date | null
      expiresAt?: Date | null
    } = {}

    if (body.code !== undefined) data.code = body.code.trim().toUpperCase()
    if (body.discountType !== undefined) {
      if (!['PERCENTAGE', 'FIXED'].includes(body.discountType)) {
        return NextResponse.json({ error: 'discountType must be PERCENTAGE or FIXED' }, { status: 400 })
      }
      data.discountType = body.discountType
    }
    if (body.value !== undefined) {
      const numericValue = Number(body.value)
      if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return NextResponse.json({ error: 'discountValue must be a positive number' }, { status: 400 })
      }
      data.discountValue = numericValue
    }
    if (body.minOrderAmount !== undefined) {
      data.minOrderAmount = body.minOrderAmount === null || body.minOrderAmount === '' ? 0 : Number(body.minOrderAmount)
    }
    if (body.maxUses !== undefined) {
      data.maxUses = body.maxUses === null || body.maxUses === '' ? null : Number(body.maxUses)
    }
    if (body.active !== undefined) data.active = Boolean(body.active)
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

    return NextResponse.json(voucher)
  } catch (error) {
    console.error('Error updating voucher:', error)
    return NextResponse.json({ error: 'Failed to update voucher' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
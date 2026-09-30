import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { updateVoucher, deleteVoucher } from '@/data/store'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { code, type, value, minSubtotal, active } = body

    const data: {
      code?: string
      type?: 'percent' | 'fixed'
      value?: number
      minSubtotal?: number | null
      active?: boolean
    } = {}
    if (code !== undefined) data.code = code
    if (type !== undefined) {
      if (type !== 'percent' && type !== 'fixed') {
        return NextResponse.json({ error: 'Type must be percent or fixed' }, { status: 400 })
      }
      data.type = type
    }
    if (value !== undefined) {
      const numericValue = Number(value)
      if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return NextResponse.json({ error: 'Value must be a positive number' }, { status: 400 })
      }
      data.value = numericValue
    }
    if (minSubtotal !== undefined) {
      data.minSubtotal =
        minSubtotal === null || minSubtotal === '' ? null : Number(minSubtotal)
    }
    if (active !== undefined) data.active = Boolean(active)

    const voucher = updateVoucher(id, data)
    if (!voucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 })
    }
    return NextResponse.json(voucher)
  } catch (error) {
    console.error('Error updating voucher:', error)
    return NextResponse.json({ error: 'Failed to update voucher' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const ok = deleteVoucher(id)
    if (!ok) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting voucher:', error)
    return NextResponse.json({ error: 'Failed to delete voucher' }, { status: 500 })
  }
}

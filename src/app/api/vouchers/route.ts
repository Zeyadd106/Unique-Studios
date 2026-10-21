import { NextResponse } from 'next/server'
import { validateVoucher } from '@/lib/catalog'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.trim() ?? ''
    const subtotal = Number(searchParams.get('subtotal') ?? 0)

    if (!code) {
      return NextResponse.json({ error: 'Voucher code is required' }, { status: 400 })
    }
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ error: 'Invalid subtotal' }, { status: 400 })
    }

    const result = await validateVoucher(code, subtotal)

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error, minSubtotal: result.minSubtotal ?? null })
    }

    return NextResponse.json({
      ok: true,
      code: result.voucher.code,
      type: result.voucher.type,
      value: result.voucher.value,
      discount: result.discount,
    })
  } catch (error) {
    console.error('Error validating voucher:', error)
    return NextResponse.json({ error: 'Failed to validate voucher' }, { status: 500 })
  }
}

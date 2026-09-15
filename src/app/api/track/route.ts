import { NextResponse } from 'next/server'
import { findOrderForTracking } from '@/data/store'

// Public order tracking: order number + checkout phone required.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')?.trim() ?? ''
    const phone = searchParams.get('phone')?.trim() ?? ''

    if (!orderNumber || !phone) {
      return NextResponse.json(
        { error: 'Order number and phone are required' },
        { status: 400 }
      )
    }

    const snapshot = findOrderForTracking(orderNumber, phone)

    if (!snapshot) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 })
  }
}

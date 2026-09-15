import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getOrders } from '@/data/store'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { orders, total } = getOrders({
      status: status ?? undefined,
      limit,
      offset,
    })

    return NextResponse.json({ orders, total })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

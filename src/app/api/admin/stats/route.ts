import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDashboardStats, getRecentOrders } from '@/data/store'

// Live stats for the admin dashboard (polled by the client every few seconds).
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    return NextResponse.json({
      stats: getDashboardStats(),
      recentOrders: getRecentOrders(limit),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

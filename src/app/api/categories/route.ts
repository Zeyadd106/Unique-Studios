import { NextResponse } from 'next/server'
import { getCategoriesWithCounts } from '@/lib/catalog'

export async function GET() {
  try {
    return NextResponse.json(await getCategoriesWithCounts({ activeOnly: true }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

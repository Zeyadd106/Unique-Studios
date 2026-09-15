import { NextResponse } from 'next/server'
import { getCategoriesWithCounts } from '@/data/store'

export async function GET() {
  try {
    const categories = getCategoriesWithCounts().filter((c) => c.active)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

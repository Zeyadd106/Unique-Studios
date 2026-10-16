import { NextResponse } from 'next/server'
import { getCategoriesWithCounts } from '@/data/store'

export async function GET() {
  try {
    return NextResponse.json(getCategoriesWithCounts())
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

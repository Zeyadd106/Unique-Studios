import { NextResponse } from 'next/server'
import { queryProducts } from '@/data/store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const products = queryProducts({
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      sort: searchParams.get('sort') || 'featured',
      size: searchParams.get('size') ?? undefined,
      color: searchParams.get('color') ?? undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStockOnly: searchParams.get('inStockOnly') === 'true',
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

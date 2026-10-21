import { NextResponse } from 'next/server'
import { queryProducts } from '@/lib/catalog'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category') ?? undefined
    const search = searchParams.get('search') ?? undefined
    const sort = searchParams.get('sort') || 'featured'
    const size = searchParams.get('size') ?? undefined
    const color = searchParams.get('color') ?? undefined
    const minPriceRaw = searchParams.get('minPrice')
    const maxPriceRaw = searchParams.get('maxPrice')
    const minPrice = minPriceRaw !== null && minPriceRaw !== '' ? Number(minPriceRaw) : undefined
    const maxPrice = maxPriceRaw !== null && maxPriceRaw !== '' ? Number(maxPriceRaw) : undefined
    const inStockOnly = searchParams.get('inStockOnly') === 'true'
    const newArrivals = searchParams.get('newArrivals') === 'true'

    const products = await queryProducts({
      category,
      search,
      size,
      color,
      minPrice: minPrice !== undefined && !Number.isNaN(minPrice) ? minPrice : undefined,
      maxPrice: maxPrice !== undefined && !Number.isNaN(maxPrice) ? maxPrice : undefined,
      inStockOnly,
      newArrivals,
      sort,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

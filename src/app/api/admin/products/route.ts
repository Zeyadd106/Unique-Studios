import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { PRODUCTS, createProduct } from '@/data/store'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const active = searchParams.get('active')

    let products = [...PRODUCTS]
    if (categoryId) {
      products = products.filter((p) => p.categoryId === categoryId)
    }
    if (active !== null) {
      products = products.filter((p) => p.active === (active === 'true'))
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      price,
      salePrice,
      categoryId,
      material,
      fit,
      careInstructions,
      featured,
      bestSeller,
      newArrival,
      active,
      images,
      variants,
    } = body

    const product = createProduct({
      name,
      slug,
      description,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      categoryId,
      material,
      fit,
      careInstructions,
      featured: featured || false,
      bestSeller: bestSeller || false,
      newArrival: newArrival || false,
      active: active !== false,
      images: (images ?? []).map((img: { url: string; alt?: string }) => ({
        url: img.url,
        alt: img.alt || name,
      })),
      variants: (variants ?? []).map(
        (v: { size: string; color: string; stock: string | number; weightMin?: string; weightMax?: string }) => ({
          size: v.size,
          color: v.color,
          stock: parseInt(String(v.stock)),
          weightMin: v.weightMin ? parseFloat(String(v.weightMin)) : null,
          weightMax: v.weightMax ? parseFloat(String(v.weightMax)) : null,
        })
      ),
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

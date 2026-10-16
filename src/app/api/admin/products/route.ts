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
    if (categoryId) products = products.filter((p) => p.categoryId === categoryId)
    if (active !== null && active !== undefined && active !== '') {
      products = products.filter((p) => p.active === (active === 'true'))
    }
    products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        salePrice: p.salePrice,
        active: p.active,
        featured: p.featured,
        bestSeller: p.bestSeller,
        newArrival: p.newArrival,
        category: { name: p.category.name },
        images: p.images.map((img) => ({
          id: img.id,
          url: img.url,
          cardUrl: img.cardUrl,
          thumbUrl: img.thumbUrl,
          alt: img.alt,
        })),
        variants: p.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          stock: v.stock,
        })),
      }))
    )
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
    } = body as {
      name: string
      slug: string
      description?: string
      price: number
      salePrice?: number | null
      categoryId: string
      material?: string
      fit?: string
      careInstructions?: string
      featured?: boolean
      bestSeller?: boolean
      newArrival?: boolean
      active?: boolean
      images?: { url: string; cardUrl?: string; thumbUrl?: string; alt?: string }[]
      variants?: { size: string; color: string; stock: number }[]
    }

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { error: 'name, slug and categoryId are required' },
        { status: 400 }
      )
    }

    const product = createProduct({
      name,
      slug,
      description: description ?? '',
      price: Number(price) ?? 0,
      salePrice: salePrice ?? null,
      categoryId,
      material,
      fit,
      careInstructions,
      featured: featured || false,
      bestSeller: bestSeller || false,
      newArrival: newArrival || false,
      active: active !== false,
      images,
      variants,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

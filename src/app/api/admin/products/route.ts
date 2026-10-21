import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapProduct, normalizeImages, normalizeVariants } from '@/lib/catalog'

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { orderBy: [{ color: 'asc' as const }, { size: 'asc' as const }] },
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}
    if (categoryId) where.categoryId = categoryId
    if (active !== null && active !== undefined && active !== '') {
      where.available = active === 'true'
    }

    const products = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products.map(mapProduct))
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
      available,
      images,
      variants,
    } = body

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { error: 'name, slug and categoryId are required' },
        { status: 400 },
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description ?? null,
        price: Number(price) || 0,
        salePrice: salePrice ? Number(salePrice) : null,
        categoryId,
        material: material || null,
        fit: fit || null,
        careInstructions: careInstructions || null,
        featured: Boolean(featured),
        bestSeller: Boolean(bestSeller),
        newArrival: Boolean(newArrival),
        available: active !== false && available !== false,
        images: { create: normalizeImages(images, name) },
        variants: { create: normalizeVariants(variants) },
      },
      include: productInclude,
    })

    return NextResponse.json(mapProduct(product), { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

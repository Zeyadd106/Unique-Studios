import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      where.active = active === 'true'
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        variants: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
              select: { id: true, imageUrl: true, alt: true, sortOrder: true, isPrimary: true },
            },
          },
          orderBy: { colorName: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: p.categoryId,
        price: p.price,
        salePrice: p.salePrice,
        featured: p.featured,
        available: p.available,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        category: { name: p.category.name },
        variants: p.variants,
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
      active,
      images,
      variants,
    } = body

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { error: 'name, slug and categoryId are required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description ?? null,
        price: Number(price) ?? 0,
        salePrice: salePrice ?? null,
        categoryId,
        featured: featured || false,
        available: active !== false,
        variants: variants
          ? {
              create: variants.map((v: { size: string; color: string; stock: number }) => ({
                colorName: v.color,
                stock: v.stock,
                available: true,
              })),
            }
          : undefined,
      },
      include: {
        variants: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
          },
        },
        category: { select: { name: true } },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
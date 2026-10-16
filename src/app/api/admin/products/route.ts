import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const active = searchParams.get('active')

    const where: any = {}
    if (categoryId) where.categoryId = categoryId
    if (active !== null) where.available = active === 'true'

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: 0,
        salePrice: null,
        active: p.available,
        featured: p.featured,
        bestSeller: p.featured,
        newArrival: p.featured,
        category: { name: p.category.name },
        images: p.variants.flatMap((v) =>
          v.images.map((img) => ({
            id: img.id,
            url: img.imageUrl,
            cardUrl: img.imageUrl,
            thumbUrl: img.imageUrl,
            alt: img.alt,
          }))
        ),
        variants: p.variants.map((v) => ({
          id: v.id,
          size: 'M',
          color: v.colorName,
          stock: 10,
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
    } = body

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        categoryId,
        featured: featured || false,
        available: active !== false,
      },
    })

    // Create variants and images
    if (Array.isArray(variants)) {
      for (const v of variants) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            colorName: v.color,
            colorCode: null,
            primaryImage: v.images?.[0]?.url || null,
            available: true,
          },
        })

        if (Array.isArray(v.images)) {
          for (const img of v.images) {
            await prisma.productImage.create({
              data: {
                variantId: variant.id,
                imageUrl: img.url,
                alt: img.alt || name,
                sortOrder: img.sortOrder ?? 0,
                isPrimary: img.isPrimary ?? false,
              },
            })
          }
        }
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

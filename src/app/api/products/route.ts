import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category') ?? undefined
    const search = searchParams.get('search') ?? undefined
    const sort = searchParams.get('sort') || 'featured'
    const size = searchParams.get('size') ?? undefined
    const color = searchParams.get('color') ?? undefined
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStockOnly = searchParams.get('inStockOnly') === 'true'
    const newArrivals = searchParams.get('newArrivals') === 'true'

    // Build where clause
    const where: any = {
      available: true,
    }

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (newArrivals) {
      where.featured = true // Use featured as proxy for new arrivals
    }

    // Fetch products with variants and images
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: {
          where: color ? { colorName: color } : undefined,
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: sort === 'featured' ? { featured: 'desc' } : { createdAt: 'desc' },
    })

    // Filter by size (variants must have a variant with this color/size available)
    // Note: sizes aren't stored as separate fields in the current schema variants
    // We filter by color already above. Size filtering would need variant size field.

    // Transform to match existing Product type shape
    const transformed = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      price: 0, // Price not in schema yet; variants handle color/images
      salePrice: null,
      categoryId: p.categoryId,
      category: {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
        description: p.category.description,
        image: p.category.image,
        active: p.category.active,
        createdAt: p.category.createdAt,
        updatedAt: p.category.updatedAt,
      },
      material: null,
      fit: null,
      careInstructions: null,
      featured: p.featured,
      bestSeller: p.featured,
      newArrival: p.featured,
      active: p.available,
      images: p.variants.flatMap((v) =>
        v.images.map((img) => ({
          id: img.id,
          productId: p.id,
          url: img.imageUrl,
          cardUrl: img.imageUrl,
          thumbUrl: img.imageUrl,
          alt: img.alt ?? p.name,
          sortOrder: img.sortOrder,
          createdAt: img.createdAt,
        }))
      ),
      variants: p.variants.map((v) => ({
        id: v.id,
        productId: p.id,
        size: 'M', // Default size; not tracked per variant yet
        color: v.colorName,
        stock: 10, // Default stock; not tracked per variant yet
        weightMin: null,
        weightMax: null,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

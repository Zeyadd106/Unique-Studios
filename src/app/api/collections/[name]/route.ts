import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const categorySlug = name.toLowerCase()

    // Find the category by slug
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Fetch products in this category with variants and images
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        available: true,
      },
      include: {
        category: true,
        variants: {
          where: { available: true },
          orderBy: { colorName: 'asc' },
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    })

    // Transform: each variant becomes a distinct product card entry
    // (no color swatches on collection page — each variant is its own card)
    const collectionProducts = products.flatMap((product) => {
      return product.variants.map((variant) => {
        const images = variant.images.map((img) => ({
          id: img.id,
          url: img.imageUrl,
          cardUrl: img.imageUrl,
          thumbUrl: img.imageUrl,
          alt: img.alt ?? product.name,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        }))

        return {
          id: variant.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
          },
          // Primary image is the first image of this variant
          image: images[0]?.url || null,
          images,
          imageCount: images.length,
          price: product.price,
          salePrice: product.salePrice,
          available: variant.available,
          colorName: variant.colorName,
          featured: product.featured,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }
      })
    })

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
      },
      products: collectionProducts,
      totalProducts: collectionProducts.length,
    })
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}

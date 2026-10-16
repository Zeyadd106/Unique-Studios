import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { slug },
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
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Group images by variant color for the frontend color-based gallery
    const variantsByColor = product.variants.map((v) => ({
      id: v.id,
      colorName: v.colorName,
      colorCode: v.colorCode,
      primaryImage: v.primaryImage,
      available: v.available,
      images: v.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        alt: img.alt ?? product.name,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })),
    }))

    // All images (for backward compatibility, first variant's images)
    const allImages = product.variants.length > 0
      ? product.variants[0].images.map((img) => ({
          id: img.id,
          productId: product.id,
          url: img.imageUrl,
          cardUrl: img.imageUrl,
          thumbUrl: img.imageUrl,
          alt: img.alt ?? product.name,
          sortOrder: img.sortOrder,
          createdAt: img.createdAt,
        }))
      : []

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      price: 0,
      salePrice: null,
      categoryId: product.categoryId,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        description: product.category.description,
        image: product.category.image,
        active: product.category.active,
        createdAt: product.category.createdAt,
        updatedAt: product.category.updatedAt,
      },
      material: null,
      fit: null,
      careInstructions: null,
      featured: product.featured,
      bestSeller: product.featured,
      newArrival: product.featured,
      active: product.available,
      images: allImages,
      variants: product.variants.map((v) => ({
        id: v.id,
        productId: product.id,
        size: 'M',
        color: v.colorName,
        stock: 10,
        weightMin: null,
        weightMax: null,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      })),
      variantsByColor,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

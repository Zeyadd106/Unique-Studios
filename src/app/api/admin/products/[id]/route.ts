import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
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
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: 0,
      salePrice: null,
      categoryId: product.categoryId,
      material: null,
      fit: null,
      careInstructions: null,
      featured: product.featured,
      bestSeller: product.featured,
      newArrival: product.featured,
      active: product.available,
      images: product.variants.flatMap((v) =>
        v.images.map((img) => ({
          id: img.id,
          url: img.imageUrl,
          cardUrl: img.imageUrl,
          thumbUrl: img.imageUrl,
          alt: img.alt,
        }))
      ),
      variants: product.variants.map((v) => ({
        id: v.id,
        size: 'M',
        color: v.colorName,
        stock: 10,
        weightMin: null,
        weightMax: null,
      })),
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        categoryId,
        featured: featured || false,
        available: active !== false,
      },
    })

    // Replace variants and images if provided
    if (Array.isArray(variants)) {
      // Delete existing images and variants
      await prisma.productImage.deleteMany({
        where: { variant: { productId: id } },
      })
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      })

      // Create new variants and images
      for (const v of variants) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: id,
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
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

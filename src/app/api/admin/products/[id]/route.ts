import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mapProduct, normalizeImages, normalizeVariants } from '@/lib/catalog'

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { orderBy: [{ color: 'asc' as const }, { size: 'asc' as const }] },
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(mapProduct(product))
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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
    } = body as Record<string, unknown>

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name: String(name) } : {}),
          ...(slug !== undefined ? { slug: String(slug) } : {}),
          ...(description !== undefined ? { description: description ? String(description) : null } : {}),
          ...(price !== undefined ? { price: Number(price) || 0 } : {}),
          ...(salePrice !== undefined ? { salePrice: salePrice ? Number(salePrice) : null } : {}),
          ...(categoryId !== undefined ? { categoryId: String(categoryId) } : {}),
          ...(material !== undefined ? { material: material ? String(material) : null } : {}),
          ...(fit !== undefined ? { fit: fit ? String(fit) : null } : {}),
          ...(careInstructions !== undefined
            ? { careInstructions: careInstructions ? String(careInstructions) : null }
            : {}),
          ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
          ...(bestSeller !== undefined ? { bestSeller: Boolean(bestSeller) } : {}),
          ...(newArrival !== undefined ? { newArrival: Boolean(newArrival) } : {}),
          ...(active !== undefined || available !== undefined
            ? { available: active !== false && available !== false }
            : {}),
        },
      })

      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } })
        const created = normalizeImages(images as { url?: string }[], String(name ?? existing.name))
        if (created.length > 0) {
          await tx.productImage.createMany({
            data: created.map((image) => ({ ...image, productId: id })),
          })
        }
      }

      if (Array.isArray(variants)) {
        await tx.productVariant.deleteMany({ where: { productId: id } })
        const created = normalizeVariants(variants as { size?: string; color?: string }[])
        if (created.length > 0) {
          await tx.productVariant.createMany({
            data: created.map((variant) => ({ ...variant, productId: id })),
          })
        }
      }
    })

    const refreshed = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    })

    return NextResponse.json(refreshed ? mapProduct(refreshed) : null)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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

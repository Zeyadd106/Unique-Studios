import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
        category: { select: { name: true } },
        variants: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
          },
          orderBy: { colorName: 'asc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
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

    const { id } = await params
    const body = await request.json()

    const {
      variants,
      ...rest
    } = body as {
      variants?: { size: string; color: string; stock: number }[]
      [key: string]: unknown
    }

    // Update product base fields
    const { variants: _, ...updateData } = rest
    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        variants: {
          include: { images: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { colorName: 'asc' },
        },
        category: { select: { name: true } },
      },
    })

    // Replace variants if provided
    if (Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: id } })
      await prisma.productVariant.createMany({
        data: variants.map((v: { size: string; color: string; stock: number }) => ({
          productId: id,
          colorName: v.color,
          stock: v.stock,
          available: true,
        })),
      })
    }

    // Return updated product with relations
    const refreshed = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: { images: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { colorName: 'asc' },
        },
        category: { select: { name: true } },
      },
    })

    return NextResponse.json(refreshed)
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
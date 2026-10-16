import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  getProductById,
  updateProduct,
  deleteProduct,
  replaceProductImages,
} from '@/data/store'

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
    const product = getProductById(id)

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

    const body = await request.json()
    const { id } = await params

    const { images, variants, ...rest } = body as {
      images?: { url: string; cardUrl?: string; thumbUrl?: string; alt?: string }[]
      variants?: { size: string; color: string; stock: number }[]
      [key: string]: unknown
    }

    const updated = updateProduct(id, rest)
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (Array.isArray(images)) {
      replaceProductImages(id, images)
    }

    // Variant replacement: rebuild via delete + re-add is out of scope for the
    // in-memory store — variants are edited through the product form's full
    // save. Silently ignore here to avoid data loss.
    void variants

    return NextResponse.json(getProductById(id))
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
    const ok = deleteProduct(id)
    if (!ok) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/catalog'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const product = await getProductBySlug(slug)

    if (!product || !product.active) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const colors = [...new Set(product.variants.map((v) => v.color))]
    const variantsByColor = colors.map((colorName) => {
      const colorVariants = product.variants.filter((v) => v.color === colorName)
      return {
        id: `${product.id}-${colorName}`,
        colorName,
        colorCode: null,
        primaryImage: product.images[0]?.url ?? null,
        available: colorVariants.some((v) => v.stock > 0 && v.available),
        images: product.images.map((img) => ({
          id: img.id,
          imageUrl: img.url,
          alt: img.alt ?? product.name,
          sortOrder: img.sortOrder,
          isPrimary: img.sortOrder === 0,
        })),
      }
    })

    return NextResponse.json({
      ...product,
      variantsByColor,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

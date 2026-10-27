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

    // Define size order based on category
    const sizeOrderMap: Record<string, string[]> = {
      'off-shoulder': ['S', 'M', 'L'],
      'sweatpants': ['M', 'L', 'XL'],
      'round-neck': ['M', 'L', 'XL'],
    }

    // Get size order from category slug, default to standard order
    const sizeOrder = sizeOrderMap[product.category.slug] || ['S', 'M', 'L', 'XL', 'XXL']

    const colors = [...new Set(product.variants.map((v) => v.color))]
    const variantsByColor = colors.map((colorName) => {
      const colorVariants = product.variants
        .filter((v) => v.color === colorName)
        .sort((a, b) => {
          const aIndex = sizeOrder.indexOf(a.size)
          const bIndex = sizeOrder.indexOf(b.size)
          return aIndex - bIndex
        })
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

    // Also sort the main variants array by size
    const sortedVariants = product.variants.sort((a, b) => {
      const aIndex = sizeOrder.indexOf(a.size)
      const bIndex = sizeOrder.indexOf(b.size)
      return aIndex - bIndex
    })

    return NextResponse.json({
      ...product,
      variants: sortedVariants,
      variantsByColor,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

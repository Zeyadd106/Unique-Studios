import { NextResponse } from 'next/server'
import { CATEGORIES, queryProducts } from '@/data/store'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const rawSlug = name.toLowerCase()

    // Brand alias: the "Crewnecks" collection page lives at /collections/crewnecks
    // while the catalog category slug is "round-neck".
    const ALIASES: Record<string, string> = {
      crewnecks: 'round-neck',
      crewneck: 'round-neck',
    }
    const categorySlug = ALIASES[rawSlug] ?? rawSlug

    const category = CATEGORIES.find((c) => c.slug === categorySlug)

    if (!category) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    const products = queryProducts({ category: categorySlug, sort: 'featured' })

    // One card per product (no color variant duplication).
    const collectionProducts = products.map((product) => {
      const images = product.images.map((img) => ({
        id: img.id,
        url: img.url,
        cardUrl: img.cardUrl,
        thumbUrl: img.thumbUrl,
        alt: img.alt ?? product.name,
        sortOrder: img.sortOrder,
        isPrimary: img.sortOrder === 0,
      }))
      return {
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description ?? '',
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        image: images[0]?.url || null,
        images,
        imageCount: images.length,
        price: product.price,
        salePrice: product.salePrice,
        available: product.variants.some((v) => v.stock > 0),
        colorName: null,
        featured: product.featured,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }
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

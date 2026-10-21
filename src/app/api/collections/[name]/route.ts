import { NextResponse } from 'next/server'
import { getCategoryBySlug, queryProducts } from '@/lib/catalog'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params
    const rawSlug = name.toLowerCase()
    const category = await getCategoryBySlug(rawSlug)

    if (!category) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 },
      )
    }

    const products = await queryProducts({ category: category.slug, sort: 'featured' })

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
      { status: 500 },
    )
  }
}

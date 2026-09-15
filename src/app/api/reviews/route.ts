import { NextResponse } from 'next/server'
import { addReview, getProductById, getProductReviews, getRatingSummary } from '@/data/store'
import { reviewSchema } from '@/lib/validations'
import { ZodError } from 'zod'

// Public: list reviews + rating summary for a product.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')?.trim() ?? ''

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    return NextResponse.json({
      reviews: getProductReviews(productId),
      summary: getRatingSummary(productId),
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// Public: submit a review (no login needed, like checkout).
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = reviewSchema.parse(body)

    if (!getProductById(data.productId)) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const review = addReview(data)
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

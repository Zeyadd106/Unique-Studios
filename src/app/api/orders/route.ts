import { NextResponse } from 'next/server'
import { checkoutSchema } from '@/lib/validations'
import { createOrder } from '@/data/store'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate checkout data
    const validatedData = checkoutSchema.parse(body)

    const { items, ...customerData } = validatedData

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Create order in the in-memory store (also decrements variant stock).
    const order = createOrder({
      customerName: customerData.customerName,
      phone: customerData.phone,
      secondaryPhone: customerData.secondaryPhone,
      email: customerData.email,
      address: customerData.address,
      city: customerData.city,
      apartment: customerData.apartment,
      notes: customerData.notes,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

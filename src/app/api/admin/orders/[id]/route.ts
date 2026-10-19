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
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      secondaryPhone: order.secondaryPhone,
      email: order.email,
      address: order.address,
      city: order.city,
      apartment: order.apartment,
      notes: order.notes,
      paymentMethod: order.paymentMethod,
      status: order.status,
      subtotal: order.subtotal,
      voucherCode: order.voucherCode,
      discountAmount: order.discountAmount,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
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
    const { status } = body

    const validStatuses = ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { id } = await params
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    })

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      secondaryPhone: order.secondaryPhone,
      email: order.email,
      address: order.address,
      city: order.city,
      apartment: order.apartment,
      notes: order.notes,
      paymentMethod: order.paymentMethod,
      status: order.status,
      subtotal: order.subtotal,
      voucherCode: order.voucherCode,
      discountAmount: order.discountAmount,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
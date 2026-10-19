import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Get stats and recent orders in parallel
    const [
      totalOrders,
      newOrders,
      totalRevenue,
      totalProducts,
      lowStockProducts,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'NEW' } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      prisma.product.count({ where: { available: true } }),
      // Low stock: not tracked in DB yet, return 0
      Promise.resolve(0),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ])

    const stats = {
      totalOrders,
      newOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalProducts,
      lowStockProducts,
      confirmedOrders,
      processingOrders,
      shippedOrders,
    }

    return NextResponse.json({
      stats,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        phone: o.phone,
        secondaryPhone: o.secondaryPhone,
        email: o.email,
        address: o.address,
        city: o.city,
        apartment: o.apartment,
        notes: o.notes,
        paymentMethod: o.paymentMethod,
        status: o.status,
        subtotal: o.subtotal,
        voucherCode: o.voucherCode,
        discountAmount: o.discountAmount,
        total: o.total,
        items: o.items,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
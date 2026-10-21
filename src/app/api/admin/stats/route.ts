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

    // Try to get low stock count, fallback to 0 if Prisma client is stale
    let lowStockProducts = 0
    try {
      lowStockProducts = await prisma.productVariant.count({ where: { stock: { lte: 5 } } })
    } catch {
      // Prisma client may not have stock field yet (old client)
      lowStockProducts = 0
    }

    // Get stats and recent orders in parallel
    const [
      totalOrders,
      newOrders,
      totalRevenue,
      totalProducts,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'NEW' } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
      prisma.product.count({ where: { available: true } }),
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
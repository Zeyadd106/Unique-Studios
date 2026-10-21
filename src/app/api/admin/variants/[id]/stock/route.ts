import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    let body: { stock?: number; available?: boolean } = {}
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    
    const { stock, available } = body

    const variant = await prisma.productVariant.findUnique({ where: { id } })
    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
    }

    const updateData: { stock?: number; available?: boolean } = {}
    
    if (stock !== undefined) {
      const stockNum = Number(stock)
      if (!Number.isFinite(stockNum) || stockNum < 0) {
        return NextResponse.json({ error: 'Stock must be a non-negative number' }, { status: 400 })
      }
      updateData.stock = stockNum
    }

    if (available !== undefined) {
      updateData.available = Boolean(available)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await prisma.productVariant.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      productId: updated.productId,
      size: updated.size,
      color: updated.color,
      stock: updated.stock,
      available: updated.available,
      weightMin: updated.weightMin,
      weightMax: updated.weightMax,
    })
  } catch (error) {
    console.error('Error updating variant:', error)
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 })
  }
}
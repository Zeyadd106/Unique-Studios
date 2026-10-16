import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            products: {
              where: { available: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        active: c.active,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        _count: { products: c._count.products },
      }))
    )
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

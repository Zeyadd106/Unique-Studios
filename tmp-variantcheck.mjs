import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: {
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
    orderBy: { slug: 'asc' },
  })
  for (const p of products) {
    console.log(
      `PRODUCT ${p.slug} / ${p.name} / category=${p.category.slug}`,
    )
    for (const v of p.variants) {
      const urls = v.images.map((i) => i.imageUrl)
      const primary = v.primaryImage
      console.log(
        `  VARIANT ${v.colorName} primary=${primary} (${urls.length} images)`,
      )
      for (const url of urls) {
        console.log('    ' + url)
      }
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error)
    return prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    include: {
      variants: {
        include: { images: true },
      },
    },
  })
  for (const p of products) {
    const urls = new Set()
    for (const v of p.variants) {
      for (const img of v.images) {
        urls.add(img.imageUrl)
      }
    }
    console.log(
      `${p.slug} (${p.name}): ${urls.size} unique image urls`,
    )
    for (const url of urls) {
      console.log('   ' + url)
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error)
    return prisma.$disconnect()
  })

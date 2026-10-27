import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Explicitly use PostgreSQL client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

const COLORS = ['Black', 'White', 'Gray', 'Navy']

function weightRangeForSize(size: string): { weightMin: number; weightMax: number } {
  switch (size) {
    case 'S': return { weightMin: 45, weightMax: 60 }
    case 'M': return { weightMin: 55, weightMax: 70 }
    case 'L': return { weightMin: 70, weightMax: 85 }
    case 'XL': return { weightMin: 85, weightMax: 100 }
    case 'XXL': return { weightMin: 100, weightMax: 120 }
    default: return { weightMin: 70, weightMax: 85 }
  }
}

async function main() {
  console.log('Seeding production database...')

  // Create admin user
  const email = 'admin@uniquestudios.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = 'Admin User'

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email } })
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.adminUser.create({
      data: { email, password: passwordHash, name, role: 'admin', active: true },
    })
    console.log('Created admin user:', email)
  } else {
    console.log('Admin user already exists:', email)
  }

  // Create categories
  const categories = [
    { id: 'cat-off-shoulder', name: 'Off Shoulder', slug: 'off-shoulder', description: 'Off-shoulder tops with a relaxed feminine fit', image: '/images/products/off shoulder/IMG_5635.JPG.jpeg', active: true },
    { id: 'cat-sweatpants', name: 'Sweatpants', slug: 'sweatpants', description: 'Comfortable sweatpants with premium fit', image: '/images/products/sweatpants/IMG_5802.PNG', active: true },
    { id: 'cat-round-neck', name: 'Crewneck', slug: 'round-neck', description: 'Classic crewneck sweatshirts for everyday wear', image: '/images/optimized/IMG_5546-card.webp', active: true },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }
  console.log('Categories seeded')

  // Create products
  const products = [
    {
      id: 'prod-off-shoulder-01',
      name: 'Off shoulder sweater Baby blue ',
      slug: 'off-shoulder-signature-navy',
      description: 'Signature navy off-shoulder top with premium quality.',
      price: 699,
      salePrice: null,
      categoryId: 'cat-off-shoulder',
      material: '80% Cotton, 20% Polyester',
      fit: 'Relaxed Off-Shoulder',
      careInstructions: 'Machine wash cold, tumble dry low',
      featured: true,
      bestSeller: true,
      newArrival: true,
      available: true,
      sizes: ['S', 'M', 'L'],
      images: [
        { url: '/images/products/off shoulder/IMG_5635.JPG.jpeg', alt: 'Off Shoulder Signature Navy - front view', isPrimary: true },
        { url: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5636.JPG.jpeg', alt: 'Off Shoulder Signature Navy - side view' },
        { url: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5637.JPG.jpeg', alt: 'Off Shoulder Signature Navy - detail view' },
        { url: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5639.JPG.jpeg', alt: 'Off Shoulder Signature Navy - back view' },
      ],
    },
    {
      id: 'prod-off-shoulder-02',
      name: 'Off shoulder sweater Black',
      slug: 'off-shoulder-essential-gray',
      description: 'Essential gray off-shoulder top with premium quality.',
      price: 699,
      salePrice: null,
      categoryId: 'cat-off-shoulder',
      material: '80% Cotton, 20% Polyester',
      fit: 'Relaxed Off-Shoulder',
      careInstructions: 'Machine wash cold, tumble dry low',
      featured: true,
      bestSeller: true,
      newArrival: true,
      available: true,
      sizes: ['S', 'M', 'L'],
      images: [
        { url: '/images/products/off shoulder/IMG_5642.PNG', alt: 'Off Shoulder Essential Gray - front view', isPrimary: true },
        { url: '/images/products/off shoulder/off-shoulder-product-slide/image-2/IMG_5640.JPG.jpeg', alt: 'Off Shoulder Essential Gray - side view' },
        { url: '/images/products/off shoulder/off-shoulder-product-slide/image-2/IMG_5644.PNG', alt: 'Off Shoulder Essential Gray - detail view' },
      ],
    },
    {
      id: 'prod-off-shoulder-03',
      name: 'Off shoulder sweater Burgundy',
      slug: 'off-shoulder-street-style',
      description: 'Street style off-shoulder top with urban design.',
      price: 699,
      salePrice: null,
      categoryId: 'cat-off-shoulder',
      material: '80% Cotton, 20% Polyester',
      fit: 'Relaxed Off-Shoulder',
      careInstructions: 'Machine wash cold, tumble dry low',
      featured: true,
      bestSeller: true,
      newArrival: true,
      available: true,
      sizes: ['S', 'M', 'L'],
      images: [
        { url: '/images/products/off shoulder/IMG_5646.PNG', alt: 'Off Shoulder Street Style - front view', isPrimary: true },
        { url: '/images/products/off shoulder/off-shoulder-product-slide/image-3/IMG_5626.JPG.jpeg', alt: 'Off Shoulder Street Style - side view' },
        { url: '/images/products/off shoulder/off-shoulder-product-slide/image-3/IMG_5648.PNG', alt: 'Off Shoulder Street Style - detail view' },
      ],
    },
    {
      id: 'prod-sweatpants-01',
      name: 'Sweatpants Gray',
      slug: 'sweatpants',
      description: 'Comfortable sweatpants with drawstring waist and cuffed ankles. Size chart (hip × length): M 53 × 107 cm, L 56 × 110 cm, XL 60 × 113 cm.',
      price: 799,
      salePrice: null,
      categoryId: 'cat-sweatpants',
      material: '80% Cotton, 20% Polyester',
      fit: 'Relaxed',
      careInstructions: 'Machine wash cold, tumble dry low',
      featured: true,
      bestSeller: true,
      newArrival: true,
      available: true,
      sizes: ['M', 'L', 'XL'],
      images: [
        { url: '/images/products/sweatpants/IMG_5611.JPG.jpeg', alt: 'Signature Sweatpants - front view', isPrimary: true },
        { url: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5581.JPG.jpeg', alt: 'Signature Sweatpants - side view' },
        { url: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5584.JPG.jpeg', alt: 'Signature Sweatpants - detail view' },
        { url: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5586.JPG.jpeg', alt: 'Signature Sweatpants - back view' },
        { url: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5587.JPG.jpeg', alt: 'Signature Sweatpants - lifestyle view' },
      ],
    },
    {
      id: 'prod-sweatpants-02',
      name: 'Sweatpants Black',
      slug: 'sweatpants-premium-edition',
      description: 'Premium edition sweatpants with exclusive design.',
      price: 799,
      salePrice: null,
      categoryId: 'cat-sweatpants',
      material: '80% Cotton, 20% Polyester',
      fit: 'Relaxed',
      careInstructions: 'Machine wash cold, tumble dry low',
      featured: true,
      bestSeller: true,
      newArrival: true,
      available: true,
      sizes: ['M', 'L', 'XL'],
      images: [
        { url: '/images/products/sweatpants/IMG_5802.PNG', alt: 'Sweatpants Premium Edition - front view', isPrimary: true },
        { url: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5590.PNG', alt: 'Sweatpants Premium Edition - side view' },
        { url: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5591.PNG', alt: 'Sweatpants Premium Edition - detail view' },
        { url: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5593.PNG', alt: 'Sweatpants Premium Edition - back view' },
        { url: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5594.PNG', alt: 'Sweatpants Premium Edition - lifestyle view' },
      ],
    },
    {
      id: 'prod-round-neck',
      name: 'Streetwear CrewNeck White',
      slug: 'round-neck',
      description: 'Classic crewneck sweatshirt with ribbed cuffs and hem. Size chart (length × width): M 67 × 63 cm, L 70 × 66 cm, XL 73 × 69 cm.',
      price: 849,
      salePrice: null,
      categoryId: 'cat-round-neck',
      material: '100% Heavyweight Cotton',
      fit: 'Relaxed',
      careInstructions: 'Machine wash cold, hang dry',
      featured: true,
      bestSeller: false,
      newArrival: true,
      available: true,
      sizes: ['M', 'L', 'XL'],
      images: [
        { url: '/images/products/Crewnecks/IMG_5544.JPG.jpeg', alt: 'Heavyweight Crewneck - front view', isPrimary: true },
        { url: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5545.JPG.jpeg', alt: 'Heavyweight Crewneck - side view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5549.JPG.jpeg', alt: 'Heavyweight Crewneck - detail view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5550.JPG.jpeg', alt: 'Heavyweight Crewneck - back view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5554.JPG.jpeg', alt: 'Heavyweight Crewneck - lifestyle view' },
      ],
    },
    {
      id: 'prod-crewneck-01',
      name: 'Streetwear CrewNeck Pink',
      slug: 'crewneck-premium-gray',
      description: 'Premium gray crewneck with heavyweight fabric.',
      price: 849,
      salePrice: null,
      categoryId: 'cat-round-neck',
      material: '100% Heavyweight Cotton',
      fit: 'Relaxed',
      careInstructions: 'Machine wash cold, hang dry',
      featured: true,
      bestSeller: true,
      newArrival: true,
      available: true,
      sizes: ['M', 'L', 'XL'],
      images: [
        { url: '/images/products/Crewnecks/IMG_5557.JPG.jpeg', alt: 'Crewneck Premium Gray - front view', isPrimary: true },
        { url: '/images/products/Crewnecks/crewnecks-product-slide pink/IMG_5526(1).jpg.jpeg', alt: 'Crewneck Premium Gray - alternate view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide pink/IMG_5618.JPG.jpeg', alt: 'Crewneck Premium Gray - lifestyle view' },
      ],
    },
    {
      id: 'prod-crewneck-02',
      name: 'Streetwear CrewNeck Black',
      slug: 'crewneck-street-style',
      description: 'Street style crewneck with urban design.',
      price: 849,
      salePrice: null,
      categoryId: 'cat-round-neck',
      material: '100% Heavyweight Cotton',
      fit: 'Relaxed',
      careInstructions: 'Machine wash cold, hang dry',
      featured: true,
      bestSeller: true,
      newArrival: true,
      available: true,
      sizes: ['M', 'L', 'XL'],
      images: [
        { url: '/images/products/Crewnecks/IMG_5570.JPG.jpeg', alt: 'Crewneck Street Style - front view', isPrimary: true },
        { url: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5562.JPG.jpeg', alt: 'Crewneck Street Style - side view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5563.JPG.jpeg', alt: 'Crewneck Street Style - detail view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5571.JPG.jpeg', alt: 'Crewneck Street Style - back view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5574.JPG.jpeg', alt: 'Crewneck Street Style - lifestyle view' },
      ],
    },
    {
      id: 'prod-crewneck-03',
      name: 'Streetwear CrewNeck Burgundy',
      slug: 'crewneck-essential-gray',
      description: 'Essential gray crewneck with premium fabric.',
      price: 849,
      salePrice: null,
      categoryId: 'cat-round-neck',
      material: '100% Heavyweight Cotton',
      fit: 'Relaxed',
      careInstructions: 'Machine wash cold, hang dry',
      featured: true,
      bestSeller: true,
      newArrival: true,
      available: true,
      sizes: ['M', 'L', 'XL'],
      images: [
        { url: '/images/products/Crewnecks/IMG_5608.JPG.jpeg', alt: 'Crewneck Essential Gray - front view', isPrimary: true },
        { url: '/images/products/Crewnecks/crewnecks-product-slide burgundy/1000174031.jpg.jpeg', alt: 'Crewneck Essential Gray - alternate view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide burgundy/IMG_5599.JPG.jpeg', alt: 'Crewneck Essential Gray - detail view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide burgundy/IMG_5604.JPG.jpeg', alt: 'Crewneck Essential Gray - lifestyle view' },
      ],
    },
    {
      id: 'prod-crewneck-04',
      name: 'Streetwear CrewNeck Baby blue',
      slug: 'crewneck-urban-white',
      description: 'Urban white crewneck with street style.',
      price: 849,
      salePrice: null,
      categoryId: 'cat-round-neck',
      material: '100% Heavyweight Cotton',
      fit: 'Relaxed',
      careInstructions: 'Machine wash cold, hang dry',
      featured: true,
      bestSeller: true,
      newArrival: true,
      available: true,
      sizes: ['M', 'L', 'XL'],
      images: [
        { url: '/images/products/Crewnecks/IMG_5617.JPG.jpeg', alt: 'Crewneck Urban White - front view', isPrimary: true },
        { url: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5526(2).jpg.jpeg', alt: 'Crewneck Urban White - side view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5546.JPG.jpeg', alt: 'Crewneck Urban White - detail view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5616.JPG.jpeg', alt: 'Crewneck Urban White - back view' },
        { url: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5622.JPG.jpeg', alt: 'Crewneck Urban White - lifestyle view' },
      ],
    },
  ]

  for (const prod of products) {
    const { sizes, images, ...productData } = prod

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: productData,
      create: {
        ...productData,
        images: {
          create: images.map((img, i) => ({
            imageUrl: img.url,
            cardUrl: img.url,
            thumbUrl: img.url,
            alt: img.alt,
            sortOrder: i,
            isPrimary: img.isPrimary || i === 0,
          })),
        },
        variants: {
          create: sizes.flatMap((size) =>
            COLORS.map((color) => {
              const { weightMin, weightMax } = weightRangeForSize(size)
              const stock = 8 + ((sizes.indexOf(size) * 7 + COLORS.indexOf(color) * 3) % 15)
              return {
                size,
                color,
                stock,
                weightMin,
                weightMax,
                available: true,
              }
            })
          ),
        },
      },
    })
  }
  console.log('Products seeded')

  // Create vouchers
  await prisma.voucher.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: 'Welcome discount',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 0,
      maxUses: null,
      usedCount: 0,
      active: true,
    },
  })

  await prisma.voucher.upsert({
    where: { code: 'UNIQUE50' },
    update: {},
    create: {
      code: 'UNIQUE50',
      description: 'Fixed discount',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderAmount: 500,
      maxUses: null,
      usedCount: 0,
      active: true,
    },
  })
  console.log('Vouchers seeded')

  console.log('Production database seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

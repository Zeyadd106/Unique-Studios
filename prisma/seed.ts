/**
 * Database Seed Script
 *
 * Populates the database with initial categories, products, and an admin user.
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // ---------------------------------------------------------------------------
  // Admin User
  // ---------------------------------------------------------------------------
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@uniquestudios.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@uniquestudios.com',
      password: adminPassword,
      role: 'admin',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'crewnecks' },
      update: {},
      create: {
        name: 'Crewnecks',
        slug: 'crewnecks',
        description: 'Heavyweight crewneck sweatshirts for everyday wear',
        image: '/images/optimized/IMG_5546-card.webp',
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'off-shoulder' },
      update: {},
      create: {
        name: 'Off Shoulder',
        slug: 'off-shoulder',
        description: 'Off-shoulder tops with a relaxed feminine fit',
        image: '/images/products/off shoulder/IMG_5635.JPG.jpeg',
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sweatpants' },
      update: {},
      create: {
        name: 'Sweatpants',
        slug: 'sweatpants',
        description: 'Comfortable sweatpants with premium fit',
        image: '/images/products/sweatpants/IMG_5611.JPG.jpeg',
        active: true,
      },
    }),
  ])
  console.log('✅ Categories created:', categories.map((c) => c.name).join(', '))

  const [crewneckCat, offShoulderCat, sweatpantsCat] = categories

  // ---------------------------------------------------------------------------
  // Products & Variants
  // ---------------------------------------------------------------------------
  // Crewneck Products
  const crewneckProducts = await Promise.all([
    createProductWithVariants({
      name: 'Heavyweight Crewneck - Black',
      slug: 'heavyweight-crewneck-black',
      description: 'Premium heavyweight cotton crewneck in classic black. 450gsm brushed fleece.',
      price: 849,
      salePrice: 699,
      categoryId: crewneckCat.id,
      featured: true,
      bestSeller: true,
      colors: [
        { name: 'Black', code: '#000000', stock: 50 },
        { name: 'Gray', code: '#6B7280', stock: 30 },
        { name: 'Navy', code: '#1E3A5F', stock: 25 },
      ],
      sizes: ['M', 'L', 'XL'],
    }),
    createProductWithVariants({
      name: 'Heavyweight Crewneck - White',
      slug: 'heavyweight-crewneck-white',
      description: 'Premium heavyweight cotton crewneck in crisp white. 450gsm brushed fleece.',
      price: 849,
      salePrice: null,
      categoryId: crewneckCat.id,
      featured: true,
      colors: [
        { name: 'White', code: '#FFFFFF', stock: 40 },
      ],
      sizes: ['M', 'L', 'XL'],
    }),
    createProductWithVariants({
      name: 'Heavyweight Crewneck - Burgundy',
      slug: 'heavyweight-crewneck-burgundy',
      description: 'Premium heavyweight cotton crewneck in deep burgundy. 450gsm brushed fleece.',
      price: 849,
      salePrice: 699,
      categoryId: crewneckCat.id,
      newArrival: true,
      colors: [
        { name: 'Burgundy', code: '#800020', stock: 35 },
      ],
      sizes: ['M', 'L', 'XL'],
    }),
  ])

  // Off-Shoulder Products
  const offShoulderProducts = await Promise.all([
    createProductWithVariants({
      name: 'Off-Shoulder Top - Black',
      slug: 'off-shoulder-top-black',
      description: 'Relaxed fit off-shoulder top in soft cotton blend.',
      price: 599,
      salePrice: 499,
      categoryId: offShoulderCat.id,
      featured: true,
      colors: [
        { name: 'Black', code: '#000000', stock: 45 },
        { name: 'White', code: '#FFFFFF', stock: 30 },
      ],
      sizes: ['S', 'M', 'L'],
    }),
    createProductWithVariants({
      name: 'Off-Shoulder Top - Pink',
      slug: 'off-shoulder-top-pink',
      description: 'Relaxed fit off-shoulder top in soft pink cotton blend.',
      price: 599,
      salePrice: null,
      categoryId: offShoulderCat.id,
      newArrival: true,
      colors: [
        { name: 'Pink', code: '#FCE7F3', stock: 25 },
      ],
      sizes: ['S', 'M', 'L'],
    }),
  ])

  // Sweatpants Products
  const sweatpantsProducts = await Promise.all([
    createProductWithVariants({
      name: 'Signature Sweatpants - Black',
      slug: 'signature-sweatpants-black',
      description: 'Premium heavyweight sweatpants with tapered fit. 400gsm cotton fleece.',
      price: 749,
      salePrice: 599,
      categoryId: sweatpantsCat.id,
      featured: true,
      bestSeller: true,
      colors: [
        { name: 'Black', code: '#000000', stock: 60 },
        { name: 'Gray', code: '#6B7280', stock: 40 },
      ],
      sizes: ['M', 'L', 'XL'],
    }),
    createProductWithVariants({
      name: 'Signature Sweatpants - Navy',
      slug: 'signature-sweatpants-navy',
      description: 'Premium heavyweight sweatpants with tapered fit. 400gsm cotton fleece.',
      price: 749,
      salePrice: null,
      categoryId: sweatpantsCat.id,
      colors: [
        { name: 'Navy', code: '#1E3A5F', stock: 35 },
      ],
      sizes: ['M', 'L', 'XL'],
    }),
  ])

  console.log('✅ Products created:', [
    ...crewneckProducts,
    ...offShoulderProducts,
    ...sweatpantsProducts,
  ].map((p) => p.name).join(', '))

  // ---------------------------------------------------------------------------
  // Vouchers
  // ---------------------------------------------------------------------------
  const vouchers = await Promise.all([
    prisma.voucher.upsert({
      where: { code: 'WELCOME10' },
      update: {},
      create: {
        code: 'WELCOME10',
        description: '10% off for new customers',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 0,
        maxUses: 1000,
        active: true,
      },
    }),
    prisma.voucher.upsert({
      where: { code: 'FREESHIP' },
      update: {},
      create: {
        code: 'FREESHIP',
        description: 'Free shipping on orders over 1000 EGP',
        discountType: 'FIXED',
        discountValue: 0, // Handled differently in checkout
        minOrderAmount: 1000,
        maxUses: 500,
        active: true,
      },
    }),
    prisma.voucher.upsert({
      where: { code: 'SAVE200' },
      update: {},
      create: {
        code: 'SAVE200',
        description: '200 EGP off orders over 1500 EGP',
        discountType: 'FIXED',
        discountValue: 200,
        minOrderAmount: 1500,
        maxUses: 200,
        active: true,
      },
    }),
  ])
  console.log('✅ Vouchers created:', vouchers.map((v) => v.code).join(', '))

  console.log('🎉 Database seed completed!')
}

async function createProductWithVariants(data: {
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  categoryId: string
  featured?: boolean
  bestSeller?: boolean
  newArrival?: boolean
  colors: { name: string; code: string; stock: number }[]
  sizes: string[]
}) {
  const product = await prisma.product.upsert({
    where: { slug: data.slug },
    update: {},
    create: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      salePrice: data.salePrice,
      categoryId: data.categoryId,
      featured: data.featured ?? false,
      available: true,
    },
  })

  // Create variants for each color
  for (const color of data.colors) {
    const variant = await prisma.productVariant.upsert({
      where: {
        productId_colorName: {
          productId: product.id,
          colorName: color.name,
        },
      },
      update: {},
      create: {
        productId: product.id,
        colorName: color.name,
        colorCode: color.code,
        primaryImage: `/images/optimized/${data.slug}-${color.name.toLowerCase()}-card.webp`,
        available: true,
      },
    })

    // Note: In a full implementation, you'd also create size-specific stock
    // This would require a SizeVariant model or adding sizes to ProductVariant
  }

  return product
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
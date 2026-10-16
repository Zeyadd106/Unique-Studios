/**
 * scripts/sync-products.js
 * ========================
 * Synchronizes scanned product data with the PostgreSQL/SQLite database via Prisma.
 *
 * Idempotent: running multiple times will not create duplicates.
 * Uses upsert for categories, products, variants, and images.
 *
 * Run with: npm run products:sync
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const ROOT = path.join(process.cwd(), 'public', 'images', 'products')

// Known color names for parsing folder names
const KNOWN_COLORS = [
  'black', 'blue', 'burgundy', 'gray', 'grey', 'pink', 'white',
  'navy', 'navy blue', 'red', 'green', 'yellow', 'purple', 'orange',
  'beige', 'brown', 'cream', 'nude', 'gold', 'silver',
]

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const SKIP_FILES = new Set(['.gitkeep', 'thumbs.db', '.ds_store'])
const SKIP_FILE_PREFIXES = ['whatsapp image']

const CATEGORY_MAP = [
  { keywords: ['crewneck'], name: 'Crewneck', slug: 'crewnecks', description: 'Premium crewneck sweatshirts and tops' },
  { keywords: ['off shoulder', 'off-shoulder', 'offsoulder'], name: 'Off Shoulder', slug: 'off-shoulder', description: 'Elegant off-shoulder tops and sweaters' },
  { keywords: ['sweatpants'], name: 'Sweatpants', slug: 'sweatpants', description: 'Comfortable sweatpants with premium fit' },
  { keywords: ['t-shirt', 'tshirt', 'oversized-t-shirt'], name: 'T-Shirts', slug: 't-shirts', description: 'Premium oversized T-shirts' },
  { keywords: ['hoodie', 'oversized-hoodie'], name: 'Hoodies', slug: 'hoodies', description: 'Cozy oversized hoodies' },
  { keywords: ['sweatshirt', 'studio-heavyweight'], name: 'Sweatshirts', slug: 'sweatshirts', description: 'Heavyweight sweatshirts' },
  { keywords: ['shorts'], name: 'Shorts', slug: 'shorts', description: 'Premium shorts' },
  { keywords: ['crop', 'crop-top'], name: 'Crop Tops', slug: 'crop-tops', description: 'Trendy crop tops' },
  { keywords: ['knit', 'knitwear'], name: 'Knitwear', slug: 'knitwear', description: 'Premium knitwear' },
]

// Price assignments per product slug (price and salePrice in EGP)
const PRICE_MAP = {
  'crewneck': { price: 850, salePrice: 650 },
  'off-shoulder': { price: 850, salePrice: null },
  'off-shoulder-sweater': { price: 750, salePrice: null },
  'sweatpants': { price: 650, salePrice: null },
}

function toDisplayName(raw) {
  return raw.split(/[\s_-]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

function toSlug(raw) {
  return raw.toLowerCase().split(/[\s_-]+/).filter(Boolean).join('-')
}

function isValidImage(filename) {
  const lower = filename.toLowerCase()
  if (SKIP_FILES.has(lower)) return false
  if (SKIP_FILE_PREFIXES.some((p) => lower.startsWith(p))) return false
  const ext = path.extname(lower)
  return IMAGE_EXTENSIONS.has(ext)
}

function naturalSort(a, b) {
  const al = a.toLowerCase()
  const bl = b.toLowerCase()
  if (al < bl) return -1
  if (al > bl) return 1
  return 0
}

function parseFolderName(folderName) {
  const lower = folderName.toLowerCase().trim()
  for (const color of KNOWN_COLORS.sort((a, b) => b.length - a.length)) {
    const regex = new RegExp(`\\s+${color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    const match = folderName.match(regex)
    if (match) {
      const productName = folderName.slice(0, match.index).trim()
      if (productName) {
        return { productName, color: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase() }
      }
    }
  }
  return null
}

function inferCategory(productName) {
  const lower = productName.toLowerCase()
  for (const cat of CATEGORY_MAP) {
    if (cat.keywords.some((k) => lower.includes(k))) {
      return cat
    }
  }
  return { name: 'Other Collections', slug: 'other-collections', description: 'Other collections' }
}

/**
 * Scan and return structured product data (same logic as scan-products.js).
 */
function scan() {
  if (!fs.existsSync(ROOT)) {
    throw new Error(`Products root not found: ${ROOT}`)
  }

  const entries = fs.readdirSync(ROOT, { withFileTypes: true })
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name)

  const categories = new Map()
  const warnings = []

  for (const folderName of folders) {
    const folderPath = path.join(ROOT, folderName)
    const parsed = parseFolderName(folderName)

    if (!parsed) continue

    const { productName, color } = parsed

    let files
    try {
      files = fs.readdirSync(folderPath)
    } catch (err) {
      warnings.push({ type: 'FOLDER_READ_ERROR', folder: folderName, message: err.message })
      continue
    }

    const imageFiles = files.filter(isValidImage).sort(naturalSort)
    if (imageFiles.length === 0) continue

    const category = inferCategory(productName)
    const categorySlug = category.slug
    const productSlug = toSlug(productName)

    if (!categories.has(categorySlug)) {
      categories.set(categorySlug, {
        name: category.name,
        slug: categorySlug,
        description: category.description,
        products: new Map(),
      })
    }
    const catEntry = categories.get(categorySlug)

    if (!catEntry.products.has(productSlug)) {
      const priceInfo = PRICE_MAP[productSlug] ?? { price: 750, salePrice: null }
      catEntry.products.set(productSlug, {
        name: productName,
        slug: productSlug,
        description: null,
        price: priceInfo.price,
        salePrice: priceInfo.salePrice,
        variants: new Map(),
      })
    }
    const productEntry = catEntry.products.get(productSlug)

    const images = imageFiles.map((fileName, index) => ({
      fileName,
      imageUrl: `/images/products/${folderName}/${fileName}`.replace(/ /g, '%20'),
      alt: `${productName} ${color} - Image ${index + 1}`,
      sortOrder: index,
      isPrimary: index === 0,
    }))

    const colorKey = color.toLowerCase()
    if (productEntry.variants.has(colorKey)) {
      const existing = productEntry.variants.get(colorKey)
      existing.images.push(...images)
      existing.images.sort((a, b) => a.sortOrder - b.sortOrder)
      existing.images.forEach((img, i) => { img.sortOrder = i; img.isPrimary = i === 0 })
      existing.primaryImage = existing.images[0]?.imageUrl || null
      existing.imageCount = existing.images.length
      continue
    }

    productEntry.variants.set(colorKey, {
      colorName: color,
      images,
      primaryImage: images[0]?.imageUrl || null,
      imageCount: images.length,
      available: true,
    })
  }

  return { categories, warnings }
}

async function sync() {
  const { categories, warnings } = scan()

  console.log('Starting product synchronization...')
  console.log()

  let stats = { categories: 0, products: 0, variants: 0, images: 0, skipped: 0 }

  for (const [catSlug, catEntry] of categories) {
    // Upsert category
    const category = await prisma.category.upsert({
      where: { slug: catSlug },
      update: {
        name: catEntry.name,
        description: catEntry.description,
        active: true,
      },
      create: {
        name: catEntry.name,
        slug: catSlug,
        description: catEntry.description,
        active: true,
      },
    })
    stats.categories++
    console.log(`  Category: ${category.name} (${category.slug})`)

    for (const [prodSlug, prodEntry] of catEntry.products) {
      // Upsert product
      const product = await prisma.product.upsert({
        where: { slug: prodSlug },
        update: {
          name: prodEntry.name,
          description: prodEntry.description,
          price: prodEntry.price,
          salePrice: prodEntry.salePrice,
          categoryId: category.id,
          available: true,
        },
        create: {
          name: prodEntry.name,
          slug: prodSlug,
          description: prodEntry.description,
          price: prodEntry.price,
          salePrice: prodEntry.salePrice,
          categoryId: category.id,
          available: true,
        },
      })
      stats.products++
      console.log(`    Product: ${product.name} (${product.slug})`)

      // Get existing variants to determine which to remove (no longer in scan)
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: product.id },
      })
      const existingVariantColors = new Map(existingVariants.map((v) => [v.colorName.toLowerCase(), v.id]))

      for (const [colorKey, variant] of prodEntry.variants) {
        // Upsert variant
        const dbVariant = await prisma.productVariant.upsert({
          where: { productId_colorName: { productId: product.id, colorName: variant.colorName } },
          update: {
            colorCode: null,
            primaryImage: variant.primaryImage,
            available: variant.available,
          },
          create: {
            productId: product.id,
            colorName: variant.colorName,
            colorCode: null,
            primaryImage: variant.primaryImage,
            available: variant.available,
          },
        })
        stats.variants++
        existingVariantColors.delete(colorKey)

        // Upsert images for this variant
        const existingImages = await prisma.productImage.findMany({
          where: { variantId: dbVariant.id },
        })
        const existingImageUrls = new Set(existingImages.map((img) => img.imageUrl))

        for (const img of variant.images) {
          if (existingImageUrls.has(img.imageUrl)) {
            // Update sort order and isPrimary
            await prisma.productImage.update({
              where: { id: existingImages.find((e) => e.imageUrl === img.imageUrl)?.id },
              data: { sortOrder: img.sortOrder, isPrimary: img.isPrimary, alt: img.alt },
            })
          } else {
            await prisma.productImage.create({
              data: {
                variantId: dbVariant.id,
                imageUrl: img.imageUrl,
                alt: img.alt,
                sortOrder: img.sortOrder,
                isPrimary: img.isPrimary,
              },
            })
          }
          stats.images++
        }

        // Remove images that are no longer in the scan
        const scannedImageUrls = new Set(variant.images.map((i) => i.imageUrl))
        for (const existingImg of existingImages) {
          if (!scannedImageUrls.has(existingImg.imageUrl)) {
            await prisma.productImage.delete({ where: { id: existingImg.id } })
            stats.skipped++
          }
        }
      }

      // Remove variants that are no longer in the scan
      for (const [colorName, variantId] of existingVariantColors) {
        await prisma.productVariant.delete({ where: { id: variantId } })
        stats.skipped++
        console.log(`      Removed variant: ${colorName} (no longer in scan)`)
      }
    }
  }

  console.log()
  console.log('Synchronization complete!')
  console.log(`  Categories: ${stats.categories}`)
  console.log(`  Products:   ${stats.products}`)
  console.log(`  Variants:   ${stats.variants}`)
  console.log(`  Images:     ${stats.images}`)
  console.log(`  Removed:    ${stats.skipped}`)

  if (warnings.length > 0) {
    console.log()
    console.log('Warnings:')
    for (const w of warnings) {
      console.log(`  - ${w.type}: ${w.message}`)
    }
  }

  await prisma.$disconnect()
}

sync().catch((err) => {
  console.error('Sync failed:', err)
  prisma.$disconnect()
  process.exit(1)
})

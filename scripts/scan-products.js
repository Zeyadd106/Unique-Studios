/**
 * scripts/scan-products.js
 * ========================
 * Automated product discovery scanner for UNIQUE STUDIOS.
 *
 * Recursively scans public/images/products/ and infers:
 *   - Categories (from folder naming patterns)
 *   • Products (folder name minus color suffix)
 *   - Color variants (last space-separated word matched against known colors)
 *   - Image files (jpg, jpeg, png, webp, avif)
 *
 * Outputs a structured import preview to stdout (JSON).
 * Run with: npm run products:scan
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(process.cwd(), 'public', 'images', 'products')

// Known color names (lowercase) used to parse folder names like "CrewNeck black"
const KNOWN_COLORS = [
  'black', 'blue', 'burgundy', 'gray', 'grey', 'pink', 'white',
  'navy', 'navy blue', 'red', 'green', 'yellow', 'purple', 'orange',
  'beige', 'brown', 'cream', 'nude', 'gold', 'silver',
]

// Supported image extensions
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

// Files/folders to skip entirely
const SKIP_FILES = new Set(['.gitkeep', 'thumbs.db', '.ds_store'])
const SKIP_FILE_PREFIXES = ['whatsapp image'] // WhatsApp screenshots are not product photos

// Category mapping: product name keyword -> category info
// Used to group products into categories when folder names are ambiguous
const CATEGORY_MAP = [
  { keywords: ['crewneck'], name: 'Crewneck', slug: 'crewneck', description: 'Premium crewneck sweatshirts and tops' },
  { keywords: ['off shoulder', 'off-shoulder', 'offsoulder'], name: 'Off Shoulder', slug: 'off-shoulder', description: 'Elegant off-shoulder tops and sweaters' },
  { keywords: ['sweatpants'], name: 'Sweatpants', slug: 'sweatpants', description: 'Comfortable sweatpants with premium fit' },
  { keywords: ['t-shirt', 'tshirt', 'oversized-t-shirt'], name: 'T-Shirts', slug: 't-shirts', description: 'Premium oversized T-shirts' },
  { keywords: ['hoodie', 'oversized-hoodie'], name: 'Hoodies', slug: 'hoodies', description: 'Cozy oversized hoodies' },
  { keywords: ['sweatshirt', 'studio-heavyweight'], name: 'Sweatshirts', slug: 'sweatshirts', description: 'Heavyweight sweatshirts' },
  { keywords: ['shorts'], name: 'Shorts', slug: 'shorts', description: 'Premium shorts' },
  { keywords: ['crop', 'crop-top'], name: 'Crop Tops', slug: 'crop-tops', description: 'Trendy crop tops' },
  { keywords: ['knit', 'knitwear'], name: 'Knitwear', slug: 'knitwear', description: 'Premium knitwear' },
]

/**
 * Normalize a folder/file name into a human-readable product name.
 * e.g. "CrewNeck" -> "Crewneck", "off shoulder" -> "Off Shoulder"
 */
function toDisplayName(raw) {
  return raw
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Create a URL-safe slug from a name.
 */
function toSlug(raw) {
  return raw
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .join('-')
}

/**
 * Check if a filename is a valid product image.
 */
function isValidImage(filename) {
  const lower = filename.toLowerCase()
  if (SKIP_FILES.has(lower)) return false
  if (SKIP_FILE_PREFIXES.some((p) => lower.startsWith(p))) return false
  const ext = path.extname(lower)
  return IMAGE_EXTENSIONS.has(ext)
}

/**
 * Natural sort for filenames (IMG_5531 before IMG_5543).
 */
function naturalSort(a, b) {
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()
  if (aLower < bLower) return -1
  if (aLower > bLower) return 1
  return 0
}

/**
 * Parse a top-level folder name into { productName, color } or null.
 * Returns null if the folder is a category folder (no color suffix).
 */
function parseFolderName(folderName) {
  const lower = folderName.toLowerCase().trim()

  // Find the longest matching color suffix
  for (const color of KNOWN_COLORS.sort((a, b) => b.length - a.length)) {
    const colorRegex = new RegExp(`\\s+${color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    const match = folderName.match(colorRegex)
    if (match) {
      const productName = folderName.slice(0, match.index).trim()
      if (productName) {
        return { productName, color: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase() }
      }
    }
  }

  return null // No color found — likely a category folder
}

/**
 * Infer category from a product name.
 */
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
 * Scan the products folder and return structured data.
 */
function scan() {
  if (!fs.existsSync(ROOT)) {
    console.error(`ERROR: Products root not found: ${ROOT}`)
    process.exit(1)
  }

  const entries = fs.readdirSync(ROOT, { withFileTypes: true })
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name)
  const rootFiles = entries.filter((e) => e.isFile()).map((e) => e.name)

  // Report root-level files that will be ignored
  const ignoredRootFiles = rootFiles.filter((f) => isValidImage(f))

  const categories = new Map() // slug -> { name, slug, description, products: Map(slug -> product) }
  const errors = []
  const warnings = []

  // Track all discovered product slugs to detect duplicates
  const productSlugs = new Map() // slug -> { name, folder }

  for (const folderName of folders) {
    const folderPath = path.join(ROOT, folderName)
    const parsed = parseFolderName(folderName)

    if (!parsed) {
      // Category-level folder (e.g. "crewneck/" with empty color subfolders)
      // Check if it has any images directly or in subfolders
      const subEntries = fs.readdirSync(folderPath, { withFileTypes: true })
      const subFolders = subEntries.filter((e) => e.isDirectory())
      const subFiles = subEntries.filter((e) => e.isFile() && isValidImage(e.name))

      if (subFolders.length > 0 || subFiles.length > 0) {
        warnings.push({
          type: 'CATEGORY_FOLDER_WITH_CONTENT',
          folder: folderName,
          message: `Folder "${folderName}" has no color suffix but contains content. It will be treated as a category placeholder.`,
        })
      }
      continue
    }

    const { productName, color } = parsed

    // Scan images in this folder
    let files
    try {
      files = fs.readdirSync(folderPath)
    } catch (err) {
      errors.push({
        type: 'FOLDER_READ_ERROR',
        folder: folderName,
        message: `Cannot read folder: ${err.message}`,
      })
      continue
    }

    const imageFiles = files.filter(isValidImage).sort(naturalSort)
    const nonImageFiles = files.filter((f) => !isValidImage(f) && !SKIP_FILES.has(f.toLowerCase()))

    if (imageFiles.length === 0) {
      warnings.push({
        type: 'NO_IMAGES',
        folder: folderName,
        product: productName,
        color,
        message: `No valid images found for ${productName} - ${color}`,
      })
      continue
    }

    // Report non-image files found in product folders
    if (nonImageFiles.length > 0) {
      warnings.push({
        type: 'NON_IMAGE_FILES',
        folder: folderName,
        files: nonImageFiles,
        message: `Non-image files found in ${folderName}: ${nonImageFiles.join(', ')}`,
      })
    }

    // Determine category
    const category = inferCategory(productName)
    const categorySlug = category.slug

    // Determine product slug
    const productSlug = toSlug(productName)

    // Check for duplicate product (same slug from different folder)
    if (productSlugs.has(productSlug)) {
      const existing = productSlugs.get(productSlug)
      warnings.push({
        type: 'DUPLICATE_PRODUCT_SLUG',
        folder: folderName,
        product: productName,
        slug: productSlug,
        message: `Duplicate product slug "${productSlug}" also found in folder "${existing.folder}". These may be the same product split across folders.`,
      })
      // Still add the color variant to the existing product entry
    }

    productSlugs.set(productSlug, { name: productName, folder: folderName })

    // Build image entries
    const images = imageFiles.map((fileName, index) => ({
      fileName,
      imageUrl: `/images/products/${folderName}/${fileName}`.replace(/ /g, '%20'),
      alt: `${productName} ${color} - Image ${index + 1}`,
      sortOrder: index,
      isPrimary: index === 0,
    }))

    // Get or create category entry
    if (!categories.has(categorySlug)) {
      categories.set(categorySlug, {
        name: category.name,
        slug: categorySlug,
        description: category.description,
        products: new Map(),
      })
    }
    const catEntry = categories.get(categorySlug)

    // Get or create product entry within category
    if (!catEntry.products.has(productSlug)) {
      catEntry.products.set(productSlug, {
        name: productName,
        slug: productSlug,
        description: null,
        variants: new Map(),
      })
    }
    const productEntry = catEntry.products.get(productSlug)

    // Check for duplicate color variant
    const colorKey = color.toLowerCase()
    if (productEntry.variants.has(colorKey)) {
      const existing = productEntry.variants.get(colorKey)
      warnings.push({
        type: 'DUPLICATE_COLOR_VARIANT',
        product: productName,
        color,
        message: `Duplicate color "${color}" for product "${productName}" (folder "${folderName}" vs "${existing.folder}"). Merging images.`,
      })
      // Merge images
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
      folder: folderName,
      available: true,
    })
  }

  // Convert Maps to plain objects for JSON output
  const result = {
    scanRoot: ROOT,
    scanDate: new Date().toISOString(),
    summary: {
      totalCategories: categories.size,
      totalProducts: 0,
      totalVariants: 0,
      totalImages: 0,
      ignoredRootFiles: ignoredRootFiles.length,
    },
    categories: [],
    errors,
    warnings,
  }

  for (const [catSlug, catEntry] of categories) {
    const catObj = {
      name: catEntry.name,
      slug: catEntry.slug,
      description: catEntry.description,
      productCount: catEntry.products.size,
      products: [],
    }

    for (const [prodSlug, prodEntry] of catEntry.products) {
      const variants = []
      let productImageTotal = 0

      for (const [colorKey, variant] of prodEntry.variants) {
        variants.push({
          colorName: variant.colorName,
          imageCount: variant.imageCount,
          primaryImage: variant.primaryImage,
          available: variant.available,
        })
        productImageTotal += variant.imageCount
      }

      const productObj = {
        name: prodEntry.name,
        slug: prodSlug,
        description: prodEntry.description,
        variantCount: variants.length,
        totalImages: productImageTotal,
        variants,
      }

      catObj.products.push(productObj)
      result.summary.totalProducts++
      result.summary.totalVariants += variants.length
      result.summary.totalImages += productImageTotal
    }

    catObj.products.sort((a, b) => a.name.localeCompare(b.name))
    result.categories.push(catObj)
  }

  result.categories.sort((a, b) => a.name.localeCompare(b.name))

  return result
}

/**
 * Print a human-readable import preview report.
 */
function printReport(result) {
  console.log('='.repeat(70))
  console.log('UNIQUE STUDIOS — Product Image Scan Report')
  console.log('='.repeat(70))
  console.log(`Scan root: ${result.scanRoot}`)
  console.log(`Scan date: ${result.scanDate}`)
  console.log()

  console.log('SUMMARY')
  console.log('-'.repeat(70))
  console.log(`Categories: ${result.summary.totalCategories}`)
  console.log(`Products:   ${result.summary.totalProducts}`)
  console.log(`Variants:   ${result.summary.totalVariants}`)
  console.log(`Images:     ${result.summary.totalImages}`)
  console.log(`Ignored root-level image files: ${result.summary.ignoredRootFiles}`)
  console.log()

  if (result.errors.length > 0) {
    console.log('ERRORS')
    console.log('-'.repeat(70))
    for (const err of result.errors) {
      console.log(`  [!] ${err.type}: ${err.message}`)
      if (err.folder) console.log(`      Folder: ${err.folder}`)
    }
    console.log()
  }

  if (result.warnings.length > 0) {
    console.log('WARNINGS')
    console.log('-'.repeat(70))
    for (const warn of result.warnings) {
      console.log(`  [*] ${warn.type}: ${warn.message}`)
      if (warn.folder) console.log(`      Folder: ${warn.folder}`)
      if (warn.files) console.log(`      Files: ${warn.files.join(', ')}`)
    }
    console.log()
  }

  for (const cat of result.categories) {
    console.log(`CATEGORY: ${cat.name.toUpperCase()}`)
    console.log(`  Slug: ${cat.slug} | Products: ${cat.productCount}`)
    if (cat.description) console.log(`  Description: ${cat.description}`)
    console.log()

    for (const prod of cat.products) {
      console.log(`  Product: ${prod.name}`)
      console.log(`    Slug: ${prod.slug} | Variants: ${prod.variantCount} | Total images: ${prod.totalImages}`)
      for (const v of prod.variants) {
        console.log(`    Color: ${v.colorName} | Images: ${v.imageCount} | Primary: ${v.primaryImage} | Available: ${v.available}`)
      }
      console.log()
    }
  }

  console.log('='.repeat(70))
  console.log('Scan complete. Run "npm run products:sync" to import into the database.')
  console.log('='.repeat(70))
}

const result = scan()
printReport(result)

// Also output JSON for programmatic use
console.log()
console.log('---JSON_OUTPUT_START---')
console.log(JSON.stringify(result, null, 2))
console.log('---JSON_OUTPUT_END---')

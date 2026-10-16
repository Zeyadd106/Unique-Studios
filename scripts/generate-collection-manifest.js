/**
 * scripts/generate-collection-manifest.js
 * =======================================
 * Server-side image discovery manifest for collection pages.
 *
 * Scans public/images/products/<collection>/ recursively and lists
 * every supported image file. This is a discovery tool that runs at
 * build/deploy time — the browser cannot scan the public directory.
 *
 * Product grouping (which images belong to which product) is handled
 * by the existing database (Prisma), which is synced via
 * `npm run products:sync`. This script only discovers the image files.
 *
 * Usage: node scripts/generate-collection-manifest.js crewnecks
 * Output: public/manifests/collections/crewnecks.json
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(process.cwd(), 'public', 'images', 'products')
const COLLECTION = process.argv[2] || 'crewnecks'
const COLLECTION_ROOT = path.join(ROOT, COLLECTION)
const OUT_DIR = path.join(process.cwd(), 'public', 'manifests', 'collections')
const OUT_FILE = path.join(OUT_DIR, `${COLLECTION}.json`)

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const SKIP_FILES = new Set(['.gitkeep', 'thumbs.db', '.ds_store'])
const SKIP_FILE_PREFIXES = ['whatsapp image']

function isValidImage(filename) {
  const lower = filename.toLowerCase()
  if (SKIP_FILES.has(lower)) return false
  if (SKIP_FILE_PREFIXES.some((p) => lower.startsWith(p))) return false
  const ext = path.extname(lower)
  return IMAGE_EXTENSIONS.has(ext)
}

function extractNumber(filename) {
  const match = filename.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : Infinity
}

function naturalSort(a, b) {
  const na = extractNumber(a)
  const nb = extractNumber(b)
  if (na !== nb) return na - nb
  return a.localeCompare(b)
}

function main() {
  if (!fs.existsSync(COLLECTION_ROOT)) {
    console.error(`ERROR: Collection root not found: ${COLLECTION_ROOT}`)
    process.exit(1)
  }

  // Recursively collect all image files
  const allFiles = []
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        walk(full)
      } else if (isValidImage(e.name)) {
        allFiles.push({ name: e.name, fullPath: full, dir: dir })
      }
    }
  }
  walk(COLLECTION_ROOT)

  // Sort by numeric filename
  allFiles.sort((a, b) => naturalSort(a.name, b.name))

  // Build manifest — just list all discovered images
  // Product grouping is handled by the database (Prisma)
  const manifest = {
    collection: COLLECTION,
    rootPath: COLLECTION_ROOT,
    generatedAt: new Date().toISOString(),
    totalImages: allFiles.length,
    images: allFiles.map((fileInfo, index) => {
      const relativePath = path
        .join(COLLECTION, path.relative(COLLECTION_ROOT, fileInfo.fullPath))
        .replace(/\\/g, '/')
        .replace(/ /g, '%20')
      return {
        id: `img-${index + 1}`,
        fileName: fileInfo.name,
        imageUrl: `/images/products/${relativePath}`,
        alt: `${COLLECTION} - Image ${index + 1}`,
        sortOrder: index,
      }
    }),
  }

  // Write manifest
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2))

  console.log(`Collection image manifest generated: ${OUT_FILE}`)
  console.log(`  Collection: ${COLLECTION}`)
  console.log(`  Total images discovered: ${manifest.totalImages}`)
  console.log()
  console.log('Note: Product grouping is handled by the database (Prisma).')
  console.log('      Run `npm run products:sync` to sync images to the DB.')
  console.log('      The collection API route reads from the DB.')
}

main()

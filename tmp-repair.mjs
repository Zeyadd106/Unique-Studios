/**
 * One-off repair: point ProductImage rows at the real files currently on disk
 * under public/images/products/. The image files themselves are never renamed
 * or moved.
 *
 * - Existing rows keep their variant, parsed from the colour folder encoded in
 *   the old image URL when one is present.
 * - Rows whose file no longer exists are removed.
 * - Real files that no old row referenced are appended, starting with the
 *   product's first variant.
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const ROOT = path.join(process.cwd(), 'public', 'images', 'products')

const COLOR_ORDER = [
  'black', 'blue', 'burgundy', 'gray', 'pink', 'white', 'navy',
  'red', 'green', 'yellow', 'purple', 'orange', 'beige', 'brown',
  'cream', 'nude', 'gold', 'silver',
]
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const SKIP_PREFIXES = ['whatsapp image']

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function isValidImage(filename) {
  const lower = filename.toLowerCase()
  if (SKIP_PREFIXES.some((prefix) => lower.startsWith(prefix))) return false
  const extension = path.extname(lower)
  return IMAGE_EXTENSIONS.has(extension)
}

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

/** Normalise a category slug so folder names can be matched against it. */
function normalizeSlug(value) {
  return value.toLowerCase().replace(/-/g, ' ')
}

function findDirectoryForCategory(categorySlug) {
  const names = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
  return names.find((name) =>
    normalizeSlug(name).includes(normalizeSlug(categorySlug)),
  ) ?? null
}

function listImageFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (!entry.isFile() || !isValidImage(entry.name)) continue
    files.push(entry.name)
  }
  return files.sort(naturalCompare)
}

/** Parse the colour folder encoded in an old-style image URL, if any. */
function parseColourFromOldUrl(oldUrl) {
  const match = oldUrl.match(/\/images\/products\/(.+)\/([^/?]+)$/)
  if (!match) return null
  const folder = decodeSegment(match[1])
  const fileName = decodeSegment(match[2])
  if (!fileName) return null
  const orderedColors = [...COLOR_ORDER].sort(
    (a, b) => b.length - a.length,
  )
  for (const color of orderedColors) {
    const found = fileName.match(
      new RegExp(`\\s+${escapeRegExp(color)}$`, 'i'),
    )
    if (found) {
      return color.charAt(0).toUpperCase() + color.slice(1)
    }
  }
  return null
}

function fileNameFromOldUrl(oldUrl) {
  const match = oldUrl.match(/\/images\/products\/(.+)\/([^/?]+)$/)
  if (!match) return null
  return decodeSegment(match[2])
}

function buildUrl(directoryName, fileName) {
  return `/images/products/${directoryName}/${fileName}`.replace(/ /g, '%20')
}

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: { slug: 'asc' },
  })
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { slug: 'asc' },
  })

  let reassigned = 0
  let removed = 0
  let appended = 0

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { id: product.categoryId },
    })
    if (!category) continue
    const directoryName = findDirectoryForCategory(category.slug)
    if (!directoryName) {
      console.log(`No directory for category "${category.slug}"; skipping`)
      continue
    }
    const availableFiles = listImageFiles(
      path.join(ROOT, directoryName),
    )
    if (availableFiles.length === 0) continue

    const variants = product.variants.map((variant) => ({
      variant,
      entries: [],
    }))
    const firstVariant = variants[0]
    const variantByColor = new Map(
      variants.map((variantInfo) => [
        variantInfo.variant.colorName.toLowerCase(),
        variantInfo,
      ]),
    )

    // Collect the old image rows that belong to this product.
    const variantIds = variants.map((variantInfo) => variantInfo.variant.id)
    const oldRows = await prisma.productImage.findMany({
      where: { variantId: { in: variantIds } },
      orderBy: { sortOrder: 'asc' },
    })

    for (const row of oldRows) {
      const colour = parseColourFromOldUrl(row.imageUrl)
      let owner = firstVariant
      if (colour) {
        const ownerInfo = variants.find((candidate) =>
          candidate.variant.colorName.toLowerCase() === colour.toLowerCase(),
        )
        if (ownerInfo) {
          owner = ownerInfo
        }
      }
      const fileName = fileNameFromOldUrl(row.imageUrl)
      const target = fileName && availableFiles.includes(fileName)
        ? fileName
        : null
      if (!target) {
        console.log(`  Removing ${row.imageUrl} (file not found)`)
        await prisma.productImage.delete({ where: { id: row.id } })
        removed += 1
        continue
      }
      owner.entries.push({
        fileName: target,
        rowId: row.id,
      })
    }

    // Every real file is used; files nobody covered are appended.
    const covered = new Set()
    for (const variantInfo of variants) {
      for (const entry of variantInfo.entries) covered.add(entry.fileName)
    }
    for (const fileName of availableFiles) {
      if (!covered.has(fileName)) {
        firstVariant.entries.push({ fileName })
        appended += 1
      }
    }

    // Write the per-variant image lists back.
    for (const variantInfo of variants) {
      const entries = variantInfo.entries.sort((a, b) =>
        naturalCompare(a.fileName, b.fileName),
      )
      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index]
        const newUrl = buildUrl(directoryName, entry.fileName)
        if (entry.rowId) {
          await prisma.productImage.update({
            where: { id: entry.rowId },
            data: {
              imageUrl: newUrl,
              sortOrder: index,
              isPrimary: index === 0,
              alt: `${product.name} - Image ${index + 1}`,
            },
          })
        } else {
          await prisma.productImage.create({
            data: {
              variantId: variantInfo.variant.id,
              imageUrl: newUrl,
              alt: `${product.name} - Image ${index + 1}`,
              sortOrder: index,
              isPrimary: index === 0,
            },
          })
        }
        if (index === 0) {
          await prisma.productVariant.update({
            where: { id: variantInfo.variant.id },
            data: { primaryImage: newUrl },
          })
        }
        reassigned += 1
      }
    }
  }

  console.log(
    `done: ${reassigned} images reassigned, ${removed} removed, ${appended} appended`,
  )
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  return prisma.$disconnect()
})

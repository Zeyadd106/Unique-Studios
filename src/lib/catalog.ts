import { prisma } from '@/lib/prisma'
import type { Category, Product, ProductImage, ProductVariant, Voucher } from '@/types'
import type { Prisma } from '@prisma/client'

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { orderBy: [{ color: 'asc' as const }, { size: 'asc' as const }] },
} satisfies Prisma.ProductInclude

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  crewnecks: 'round-neck',
  crewneck: 'round-neck',
}

export function resolveCategorySlug(slug: string): string {
  const normalized = slug.trim().toLowerCase()
  return CATEGORY_SLUG_ALIASES[normalized] ?? normalized
}

function mapImage(image: ProductRow['images'][number], productId: string): ProductImage {
  return {
    id: image.id,
    productId,
    url: image.imageUrl,
    cardUrl: image.cardUrl ?? image.imageUrl,
    thumbUrl: image.thumbUrl ?? image.imageUrl,
    alt: image.alt,
    sortOrder: image.sortOrder,
    isPrimary: image.isPrimary,
    createdAt: image.createdAt,
  }
}

function mapVariant(variant: ProductRow['variants'][number]): ProductVariant {
  return {
    id: variant.id,
    productId: variant.productId,
    size: variant.size,
    color: variant.color,
    stock: variant.stock,
    weightMin: variant.weightMin,
    weightMax: variant.weightMax,
    available: variant.available,
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
  }
}

export function mapCategory(category: ProductRow['category']): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

export function mapProduct(product: ProductRow): Product {
  const variants = product.variants.map(mapVariant)
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    price: product.price,
    salePrice: product.salePrice,
    categoryId: product.categoryId,
    category: mapCategory(product.category),
    material: product.material,
    fit: product.fit,
    careInstructions: product.careInstructions,
    featured: product.featured,
    bestSeller: product.bestSeller,
    newArrival: product.newArrival,
    active: product.available,
    sizes: [...new Set(variants.map((v) => v.size))],
    images: product.images.map((image) => mapImage(image, product.id)),
    variants,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export async function queryProducts(query: {
  category?: string
  search?: string
  size?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  newArrivals?: boolean
  sort?: string
  includeUnavailable?: boolean
} = {}): Promise<Product[]> {
  const {
    category,
    search,
    size,
    color,
    minPrice,
    maxPrice,
    inStockOnly,
    newArrivals,
    sort = 'featured',
    includeUnavailable = false,
  } = query

  const where: Prisma.ProductWhereInput = {}
  if (!includeUnavailable) where.available = true
  if (newArrivals) where.newArrival = true
  if (category) {
    where.category = { slug: resolveCategorySlug(category) }
  }
  if (minPrice !== undefined) {
    where.price = { ...(typeof where.price === 'object' ? where.price : {}), gte: minPrice }
  }
  if (maxPrice !== undefined) {
    where.price = { ...(typeof where.price === 'object' ? where.price : {}), lte: maxPrice }
  }

  const rows = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  })

  let result = rows.map(mapProduct)

  if (search) {
    const q = search.toLowerCase()
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    )
  }
  if (size) {
    result = result.filter((p) => p.variants.some((v) => v.size === size))
  }
  if (color) {
    result = result.filter((p) => p.variants.some((v) => v.color === color))
  }
  if (inStockOnly) {
    result = result.filter((p) => p.variants.some((v) => v.stock > 0 && v.available))
  }

  switch (sort) {
    case 'newest':
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      break
    case 'priceLow':
      result.sort((a, b) => a.price - b.price)
      break
    case 'priceHigh':
      result.sort((a, b) => b.price - a.price)
      break
    case 'bestSelling':
      result.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller))
      break
    default:
      result.sort((a, b) => Number(b.featured) - Number(a.featured))
  }

  return result
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  })
  return product ? mapProduct(product) : null
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  })
  return product ? mapProduct(product) : null
}

export async function getCategoriesWithCounts(options?: { activeOnly?: boolean }) {
  const categories = await prisma.category.findMany({
    where: options?.activeOnly === false ? undefined : { active: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  return categories.map((category) => ({
    ...mapCategory(category),
    _count: { products: category._count.products },
  }))
}

export async function getCategoryBySlug(slug: string) {
  const resolved = resolveCategorySlug(slug)
  const category = await prisma.category.findUnique({ where: { slug: resolved } })
  return category ? mapCategory(category) : null
}

export type AdminImageInput = {
  url?: string
  imageUrl?: string
  cardUrl?: string
  thumbUrl?: string
  alt?: string
}

export type AdminVariantInput = {
  size?: string
  color?: string
  stock?: number
  weightMin?: number | string | null
  weightMax?: number | string | null
}

export function normalizeImages(images: AdminImageInput[] | undefined, productName: string) {
  return (images ?? [])
    .map((image, index) => {
      const imageUrl = (image.url || image.imageUrl || '').trim()
      if (!imageUrl) return null
      return {
        imageUrl,
        cardUrl: image.cardUrl || imageUrl,
        thumbUrl: image.thumbUrl || imageUrl,
        alt: image.alt || productName,
        sortOrder: index,
        isPrimary: index === 0,
      }
    })
    .filter((image): image is NonNullable<typeof image> => image !== null)
}

export function normalizeVariants(variants: AdminVariantInput[] | undefined) {
  const seen = new Set<string>()
  return (variants ?? [])
    .map((variant) => {
      const size = (variant.size ?? '').trim()
      const color = (variant.color ?? '').trim()
      if (!size || !color) return null
      const key = `${size}::${color}`.toLowerCase()
      if (seen.has(key)) return null
      seen.add(key)
      return {
        size,
        color,
        stock: Number.isFinite(Number(variant.stock)) ? Math.max(0, Number(variant.stock)) : 0,
        weightMin:
          variant.weightMin === null || variant.weightMin === undefined || variant.weightMin === ''
            ? null
            : Number(variant.weightMin),
        weightMax:
          variant.weightMax === null || variant.weightMax === undefined || variant.weightMax === ''
            ? null
            : Number(variant.weightMax),
        available: true,
      }
    })
    .filter((variant): variant is NonNullable<typeof variant> => variant !== null)
}

export function mapVoucher(voucher: {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
  minOrderAmount: number
  maxUses: number | null
  usedCount: number
  startsAt: Date | null
  expiresAt: Date | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}): Voucher & {
  discountType: string
  discountValue: number
  minOrderAmount: number
  description: string | null
  maxUses: number | null
  usedCount: number
  startsAt: Date | null
  expiresAt: Date | null
} {
  return {
    id: voucher.id,
    code: voucher.code,
    description: voucher.description,
    type: voucher.discountType === 'PERCENTAGE' ? 'percent' : 'fixed',
    value: voucher.discountValue,
    minSubtotal: voucher.minOrderAmount > 0 ? voucher.minOrderAmount : null,
    active: voucher.active,
    createdAt: voucher.createdAt,
    updatedAt: voucher.updatedAt,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    minOrderAmount: voucher.minOrderAmount,
    maxUses: voucher.maxUses,
    usedCount: voucher.usedCount,
    startsAt: voucher.startsAt,
    expiresAt: voucher.expiresAt,
  }
}

export function parseVoucherInput(body: Record<string, unknown>) {
  const rawType = String(body.discountType ?? body.type ?? '').toUpperCase()
  const discountType =
    rawType === 'PERCENT' || rawType === 'PERCENTAGE'
      ? 'PERCENTAGE'
      : rawType === 'FIXED'
        ? 'FIXED'
        : null
  const discountValue = Number(body.discountValue ?? body.value)
  const minRaw = body.minOrderAmount ?? body.minSubtotal
  const minOrderAmount =
    minRaw === null || minRaw === undefined || minRaw === '' ? 0 : Number(minRaw)

  return { discountType, discountValue, minOrderAmount }
}

export async function validateVoucher(code: string, subtotal: number) {
  const normalized = code.trim().toUpperCase()
  if (!normalized) {
    return { ok: false as const, error: 'NOT_FOUND' as const }
  }

  const voucher = await prisma.voucher.findUnique({ where: { code: normalized } })
  if (!voucher) return { ok: false as const, error: 'NOT_FOUND' as const }
  if (!voucher.active) return { ok: false as const, error: 'INACTIVE' as const }

  const now = new Date()
  if (voucher.startsAt && now < voucher.startsAt) {
    return { ok: false as const, error: 'INACTIVE' as const }
  }
  if (voucher.expiresAt && now > voucher.expiresAt) {
    return { ok: false as const, error: 'INACTIVE' as const }
  }
  if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
    return { ok: false as const, error: 'INACTIVE' as const }
  }
  if (voucher.minOrderAmount > 0 && subtotal < voucher.minOrderAmount) {
    return {
      ok: false as const,
      error: 'MIN_SUBTOTAL' as const,
      minSubtotal: voucher.minOrderAmount,
    }
  }

  const mapped = mapVoucher(voucher)
  const raw = mapped.type === 'percent' ? (subtotal * mapped.value) / 100 : mapped.value
  const discount = Math.min(Math.max(0, Math.floor(raw)), Math.max(0, subtotal))
  return { ok: true as const, voucher: mapped, discount }
}

export async function findOrderForTracking(orderNumber: string, phone: string) {
  const num = orderNumber.trim().toUpperCase()
  const digits = phone.replace(/\D/g, '')
  if (!num || !digits) return null

  const order = await prisma.order.findUnique({
    where: { orderNumber: num },
    include: { items: true },
  })
  if (!order) return null

  const orderDigits = order.phone.replace(/\D/g, '')
  const tail = (d: string) => d.slice(-10)
  const match =
    orderDigits === digits ||
    (digits.length >= 7 &&
      orderDigits.length >= 7 &&
      (orderDigits.endsWith(tail(digits)) || digits.endsWith(tail(orderDigits))))
  if (!match) return null

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    items: order.items.map((item) => ({
      productName: item.productName,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    voucherCode: order.voucherCode,
    discountAmount: order.discountAmount,
    total: order.total,
    city: order.city,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
  }
}

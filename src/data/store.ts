// Static in-memory store — replaces PostgreSQL/Prisma.
//
// Everything lives in this module: categories, products (+ images & variants),
// a demo admin, and orders created at runtime (kept in memory for the life of
// the server process). Edit the data below to change the catalog — no database
// or migration needed.

import type { Category, Order, OrderItem, Product, ProductVariant } from '@/types'
import { generateOrderNumber } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Demo admin (login: admin@uniquestudios.com / admin123)
// ---------------------------------------------------------------------------

export const MOCK_ADMIN = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@uniquestudios.com',
  // Demo only — plain-text credential for a DB-free setup. Do not use in production.
  password: 'admin123',
  role: 'admin',
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const now = () => new Date()

export const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Oversized T-Shirts',
    slug: 'oversized-t-shirts',
    description: 'Premium oversized t-shirts for a modern streetwear look',
    image: null,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'cat-2',
    name: 'Wide-Leg Sweatpants',
    slug: 'wide-leg-sweatpants',
    description: 'Comfortable wide-leg sweatpants with premium fit',
    image: null,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'cat-3',
    name: 'Hoodies',
    slug: 'hoodies',
    description: 'Premium hoodies for cold weather and street style',
    image: null,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'cat-4',
    name: 'Sweatshirts',
    slug: 'sweatshirts',
    description: 'Heavyweight sweatshirts for everyday wear',
    image: null,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
]

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const COLORS = ['Black', 'White', 'Gray', 'Navy']

function weightRangeForSize(size: string): { weightMin: number; weightMax: number } {
  switch (size) {
    case 'S':
      return { weightMin: 45, weightMax: 60 }
    case 'M':
      return { weightMin: 55, weightMax: 70 }
    case 'L':
      return { weightMin: 70, weightMax: 85 }
    case 'XL':
      return { weightMin: 85, weightMax: 100 }
    case 'XXL':
      return { weightMin: 100, weightMax: 120 }
    default:
      return { weightMin: 70, weightMax: 85 }
  }
}

function buildVariants(productId: string, seed: number): ProductVariant[] {
  const variants: ProductVariant[] = []
  SIZES.forEach((size, sizeIdx) => {
    COLORS.forEach((color, colorIdx) => {
      // Deterministic stock between 8–22 so the catalog is stable across restarts.
      const stock = 8 + ((sizeIdx * 7 + colorIdx * 3 + seed) % 15)
      const { weightMin, weightMax } = weightRangeForSize(size)
      variants.push({
        id: `${productId}-${size}-${color}`,
        productId,
        size,
        color,
        stock,
        weightMin,
        weightMax,
        createdAt: now(),
        updatedAt: now(),
      })
    })
  })
  return variants
}

interface ProductSeed {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  categoryId: string
  material: string
  fit: string
  careInstructions: string
  featured: boolean
  bestSeller: boolean
  newArrival: boolean
}

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    id: 'prod-1',
    name: 'Essential Oversized T-Shirt',
    slug: 'essential-oversized-t-shirt',
    description:
      'Our signature oversized t-shirt made from premium cotton. Perfect for a modern streetwear aesthetic.',
    price: 450,
    salePrice: null,
    categoryId: 'cat-1',
    material: '100% Cotton',
    fit: 'Oversized',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: true,
    bestSeller: true,
    newArrival: false,
  },
  {
    id: 'prod-2',
    name: 'Heavyweight Oversized T-Shirt',
    slug: 'heavyweight-oversized-t-shirt',
    description:
      'Heavyweight cotton t-shirt with a structured oversized fit. Premium quality for everyday wear.',
    price: 550,
    salePrice: 450,
    categoryId: 'cat-1',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed Oversized',
    careInstructions: 'Machine wash cold, hang dry',
    featured: true,
    bestSeller: false,
    newArrival: true,
  },
  {
    id: 'prod-3',
    name: 'Signature Wide-Leg Sweatpants',
    slug: 'signature-wide-leg-sweatpants',
    description: 'Our signature wide-leg sweatpants with premium comfort and modern street style.',
    price: 650,
    salePrice: null,
    categoryId: 'cat-2',
    material: '80% Cotton, 20% Polyester',
    fit: 'Wide-Leg',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: true,
    bestSeller: true,
    newArrival: false,
  },
  {
    id: 'prod-4',
    name: 'Essential Hoodie',
    slug: 'essential-hoodie',
    description: 'Premium hoodie with comfortable fit and modern design. Perfect for layering.',
    price: 850,
    salePrice: null,
    categoryId: 'cat-3',
    material: '80% Cotton, 20% Polyester',
    fit: 'Regular',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: true,
    bestSeller: true,
    newArrival: false,
  },
  {
    id: 'prod-5',
    name: 'Studio Heavyweight Sweatshirt',
    slug: 'studio-heavyweight-sweatshirt',
    description: 'Heavyweight sweatshirt with premium quality cotton and modern streetwear aesthetic.',
    price: 750,
    salePrice: 600,
    categoryId: 'cat-4',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
  },
]

function buildProduct(seed: ProductSeed, index: number): Product {
  const category = CATEGORIES.find((c) => c.id === seed.categoryId)!
  return {
    ...seed,
    active: true,
    category,
    images: [
      {
        id: `${seed.id}-img-1`,
        productId: seed.id,
        url: `/images/products/${seed.slug}.svg`,
        alt: seed.name,
        sortOrder: 0,
        createdAt: now(),
      },
    ],
    variants: buildVariants(seed.id, index * 5 + 3),
    createdAt: now(),
    updatedAt: now(),
  }
}

// Mutable so admin CRUD and checkout stock updates work in-memory.
export let PRODUCTS: Product[] = PRODUCT_SEEDS.map((seed, i) => buildProduct(seed, i))

// ---------------------------------------------------------------------------
// Orders (in-memory — created via checkout, visible in admin for this run)
// ---------------------------------------------------------------------------

let ORDERS: Order[] = []

export interface CreateOrderInput {
  customerName: string
  phone: string
  secondaryPhone?: string
  email: string
  address: string
  city: string
  apartment?: string
  notes?: string
  items: {
    productId: string
    productName: string
    size: string
    color: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
}

export function createOrder(input: CreateOrderInput): Order {
  const subtotal = input.items.reduce((sum, item) => sum + item.totalPrice, 0)
  const createdAt = new Date()
  const orderId = `order-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

  const items: OrderItem[] = input.items.map((item, i) => ({
    id: `${orderId}-item-${i}`,
    orderId,
    productId: item.productId,
    productName: item.productName,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    createdAt,
  }))

  const order: Order = {
    id: orderId,
    orderNumber: generateOrderNumber(),
    customerName: input.customerName,
    phone: input.phone,
    secondaryPhone: input.secondaryPhone ?? null,
    email: input.email,
    address: input.address,
    city: input.city,
    apartment: input.apartment ?? null,
    notes: input.notes ?? null,
    paymentMethod: 'CASH_ON_DELIVERY',
    status: 'NEW',
    subtotal,
    total: subtotal,
    items,
    createdAt,
    updatedAt: createdAt,
  }

  ORDERS.unshift(order)

  // Decrement variant stock (in-memory).
  for (const item of input.items) {
    const variant = PRODUCTS.flatMap((p) => p.variants).find(
      (v) => v.productId === item.productId && v.size === item.size && v.color === item.color
    )
    if (variant) {
      variant.stock = Math.max(0, variant.stock - item.quantity)
      variant.updatedAt = new Date()
    }
  }

  return order
}

export function getOrders(options?: { status?: string; limit?: number; offset?: number }): {
  orders: Order[]
  total: number
} {
  const { status, limit = 50, offset = 0 } = options ?? {}
  const filtered = status ? ORDERS.filter((o) => o.status === status) : ORDERS
  return { orders: filtered.slice(offset, offset + limit), total: filtered.length }
}

export function getOrderById(id: string): Order | undefined {
  return ORDERS.find((o) => o.id === id)
}

export interface TrackingSnapshot {
  orderNumber: string
  status: string
  items: { productName: string; size: string; color: string; quantity: number }[]
  total: number
  city: string
  paymentMethod: string
  createdAt: Date
}

// Customer-facing lookup: order number + the phone used at checkout.
// Phone comparison is lenient (ignores formatting, matches trailing digits)
// so "+20 100 ..." and "0100 ..." both work.
export function findOrderForTracking(orderNumber: string, phone: string): TrackingSnapshot | undefined {
  const num = orderNumber.trim().toUpperCase()
  const digits = phone.replace(/\D/g, '')
  if (!num || !digits) return undefined

  const order = ORDERS.find((o) => o.orderNumber.toUpperCase() === num)
  if (!order) return undefined

  const orderDigits = order.phone.replace(/\D/g, '')
  const tail = (d: string) => d.slice(-10)
  const match =
    orderDigits === digits ||
    (digits.length >= 7 &&
      orderDigits.length >= 7 &&
      (orderDigits.endsWith(tail(digits)) || digits.endsWith(tail(orderDigits))))
  if (!match) return undefined

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    items: order.items.map((i) => ({
      productName: i.productName,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    })),
    total: order.total,
    city: order.city,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
  }
}

export const VALID_ORDER_STATUSES = ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export function updateOrderStatus(id: string, status: string): Order | undefined {
  const order = ORDERS.find((o) => o.id === id)
  if (!order) return undefined
  order.status = status
  order.updatedAt = new Date()
  return order
}

// ---------------------------------------------------------------------------
// Catalog queries (mirror the old Prisma-backed filters)
// ---------------------------------------------------------------------------

export interface ProductQuery {
  category?: string
  search?: string
  size?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  sort?: string
}

export function queryProducts(query: ProductQuery = {}): Product[] {
  const { category, search, size, color, minPrice, maxPrice, inStockOnly, sort = 'featured' } = query

  let result = PRODUCTS.filter((p) => p.active)

  if (category) {
    result = result.filter((p) => p.category.slug === category)
  }

  if (search) {
    const q = search.toLowerCase()
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    )
  }

  if (size) {
    result = result.filter((p) => p.variants.some((v) => v.size === size))
  }

  if (color) {
    result = result.filter((p) => p.variants.some((v) => v.color === color))
  }

  if (minPrice !== undefined) {
    result = result.filter((p) => p.price >= minPrice)
  }

  if (maxPrice !== undefined) {
    result = result.filter((p) => p.price <= maxPrice)
  }

  if (inStockOnly) {
    result = result.filter((p) => p.variants.some((v) => v.stock > 0))
  }

  const sorted = [...result]
  switch (sort) {
    case 'newest':
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      break
    case 'priceLow':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'priceHigh':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'bestSelling':
      sorted.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller))
      break
    default:
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured))
  }

  return sorted
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getCategoriesWithCounts(): (Category & { _count: { products: number } })[] {
  return CATEGORIES.map((category) => ({
    ...category,
    _count: {
      products: PRODUCTS.filter((p) => p.active && p.categoryId === category.id).length,
    },
  }))
}

// ---------------------------------------------------------------------------
// Admin helpers (in-memory CRUD)
// ---------------------------------------------------------------------------

export function getDashboardStats() {
  const countBy = (status: string) => ORDERS.filter((o) => o.status === status).length
  const totalRevenue = ORDERS.filter((o) => o.status !== 'CANCELLED').reduce(
    (sum, o) => sum + o.total,
    0
  )
  return {
    totalOrders: ORDERS.length,
    newOrders: countBy('NEW'),
    confirmedOrders: countBy('CONFIRMED'),
    processingOrders: countBy('PROCESSING'),
    shippedOrders: countBy('SHIPPED'),
    deliveredOrders: countBy('DELIVERED'),
    cancelledOrders: countBy('CANCELLED'),
    totalRevenue,
    totalProducts: PRODUCTS.filter((p) => p.active).length,
    lowStockProducts: PRODUCTS.flatMap((p) => p.variants).filter((v) => v.stock <= 5).length,
  }
}

export function getRecentOrders(limit = 5): Order[] {
  return ORDERS.slice(0, limit)
}

export interface AdminProductInput {
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  categoryId: string
  material?: string
  fit?: string
  careInstructions?: string
  featured?: boolean
  bestSeller?: boolean
  newArrival?: boolean
  active?: boolean
  images?: { url: string; alt?: string }[]
  variants?: {
    size: string
    color: string
    stock: number
    weightMin?: number | null
    weightMax?: number | null
  }[]
}

export function createProduct(input: AdminProductInput): Product {
  const id = `prod-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
  const category = CATEGORIES.find((c) => c.id === input.categoryId) ?? CATEGORIES[0]
  const product: Product = {
    id,
    name: input.name,
    slug: input.slug,
    description: input.description,
    price: input.price,
    salePrice: input.salePrice ?? null,
    categoryId: category.id,
    category,
    material: input.material ?? null,
    fit: input.fit ?? null,
    careInstructions: input.careInstructions ?? null,
    featured: input.featured ?? false,
    bestSeller: input.bestSeller ?? false,
    newArrival: input.newArrival ?? false,
    active: input.active ?? true,
    images: (input.images ?? []).map((img, i) => ({
      id: `${id}-img-${i}`,
      productId: id,
      url: img.url,
      alt: img.alt ?? input.name,
      sortOrder: i,
      createdAt: now(),
    })),
    variants: (input.variants ?? []).map((v) => ({
      id: `${id}-${v.size}-${v.color}`,
      productId: id,
      size: v.size,
      color: v.color,
      stock: v.stock,
      weightMin: v.weightMin ?? null,
      weightMax: v.weightMax ?? null,
      createdAt: now(),
      updatedAt: now(),
    })),
    createdAt: now(),
    updatedAt: now(),
  }
  PRODUCTS.unshift(product)
  return product
}

export function updateProduct(id: string, data: Partial<AdminProductInput>): Product | undefined {
  const product = PRODUCTS.find((p) => p.id === id)
  if (!product) return undefined
  Object.assign(product, {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.slug !== undefined ? { slug: data.slug } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.price !== undefined ? { price: data.price } : {}),
    ...(data.salePrice !== undefined ? { salePrice: data.salePrice } : {}),
    ...(data.material !== undefined ? { material: data.material } : {}),
    ...(data.fit !== undefined ? { fit: data.fit } : {}),
    ...(data.careInstructions !== undefined ? { careInstructions: data.careInstructions } : {}),
    ...(data.featured !== undefined ? { featured: data.featured } : {}),
    ...(data.bestSeller !== undefined ? { bestSeller: data.bestSeller } : {}),
    ...(data.newArrival !== undefined ? { newArrival: data.newArrival } : {}),
    ...(data.active !== undefined ? { active: data.active } : {}),
  })
  if (data.categoryId) {
    const category = CATEGORIES.find((c) => c.id === data.categoryId)
    if (category) {
      product.categoryId = category.id
      product.category = category
    }
  }
  product.updatedAt = new Date()
  return product
}

export function deleteProduct(id: string): boolean {
  const index = PRODUCTS.findIndex((p) => p.id === id)
  if (index === -1) return false
  PRODUCTS.splice(index, 1)
  return true
}

export function createCategory(input: {
  name: string
  slug: string
  description?: string
  image?: string
  active?: boolean
}): Category {
  const category: Category = {
    id: `cat-${Date.now().toString(36)}`,
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    image: input.image ?? null,
    active: input.active ?? true,
    createdAt: now(),
    updatedAt: now(),
  }
  CATEGORIES.push(category)
  return category
}

// ---------------------------------------------------------------------------
// Reviews (in-memory — seeds below are editable sample content; new reviews
// submitted by visitors live for the server run. Photo uploads are stored as
// compressed data-URLs for the demo; plug in S3/Cloudinary later by swapping
// addReview's photo handling with a remote upload and storing the URL.)
// ---------------------------------------------------------------------------

export interface Review {
  id: string
  productId: string
  author: string
  rating: number // 1–5
  comment: string
  photos: string[]
  verified: boolean
  createdAt: Date
}

interface ReviewSeed {
  productId: string
  author: string
  rating: number
  comment: string
  photos?: string[]
  daysAgo: number
}

const REVIEW_SEEDS: ReviewSeed[] = [
  {
    productId: 'prod-1',
    author: 'Ahmed M.',
    rating: 5,
    comment: 'Perfect oversized fit, heavy cotton and clean stitching. Size L fits exactly like the weight guide says.',
    photos: ['/images/products/essential-oversized-t-shirt.svg'],
    daysAgo: 2,
  },
  {
    productId: 'prod-1',
    author: 'Youssef',
    rating: 5,
    comment: 'الخامة تقيلة والشكل أحلى من الصور. المقاس مظبوط.',
    daysAgo: 6,
  },
  {
    productId: 'prod-1',
    author: 'Mariam S.',
    rating: 4,
    comment: 'Great quality for the price, only wish there were more colors.',
    daysAgo: 11,
  },
  {
    productId: 'prod-2',
    author: 'Omar K.',
    rating: 5,
    comment: 'The heavyweight fabric feels premium. Boxy fit is on point.',
    photos: ['/images/products/heavyweight-oversized-t-shirt.svg'],
    daysAgo: 3,
  },
  {
    productId: 'prod-2',
    author: 'Salma',
    rating: 4,
    comment: 'خامة ممتازة بس المقاس واسع شوية، خدوا بالكم من جدول المقاسات.',
    daysAgo: 9,
  },
  {
    productId: 'prod-3',
    author: 'Karim A.',
    rating: 5,
    comment: 'Most comfortable sweatpants I own. Wide leg looks great with sneakers.',
    daysAgo: 4,
  },
  {
    productId: 'prod-3',
    author: 'Nour',
    rating: 5,
    comment: 'مريح جداً والخامة ناعمة من جوه. طلبت قطعة تانية.',
    daysAgo: 8,
  },
  {
    productId: 'prod-4',
    author: 'Mostafa R.',
    rating: 5,
    comment: 'Warm, thick hoodie. Delivery to Giza took 3 days, COD as promised.',
    photos: ['/images/products/essential-hoodie.svg'],
    daysAgo: 5,
  },
  {
    productId: 'prod-4',
    author: 'Hana',
    rating: 4,
    comment: 'Nice hoodie, slightly long sleeves but I like the baggy look.',
    daysAgo: 13,
  },
  {
    productId: 'prod-5',
    author: 'Adham',
    rating: 5,
    comment: 'Premium feel, zero shrinkage after first wash. Highly recommended.',
    daysAgo: 7,
  },
]

function daysAgo(date: number): Date {
  return new Date(Date.now() - date * 24 * 60 * 60 * 1000)
}

const REVIEWS: Review[] = REVIEW_SEEDS.map((seed, i) => ({
  id: `review-seed-${i + 1}`,
  productId: seed.productId,
  author: seed.author,
  rating: seed.rating,
  comment: seed.comment,
  photos: seed.photos ?? [],
  verified: true,
  createdAt: daysAgo(seed.daysAgo),
}))

export interface RatingSummary {
  average: number
  count: number
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number }
}

export function getProductReviews(productId: string): Review[] {
  return REVIEWS.filter((r) => r.productId === productId).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

export function getRatingSummary(productId: string): RatingSummary {
  const reviews = getProductReviews(productId)
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as RatingSummary['distribution']
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1
  }
  const average =
    reviews.length === 0
      ? 0
      : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
  return { average, count: reviews.length, distribution }
}

export interface AddReviewInput {
  productId: string
  author: string
  rating: number
  comment: string
  photos?: string[]
}

export function addReview(input: AddReviewInput): Review {
  const review: Review = {
    id: `review-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    productId: input.productId,
    author: input.author.trim(),
    rating: input.rating,
    comment: input.comment.trim(),
    photos: input.photos ?? [],
    verified: false,
    createdAt: new Date(),
  }
  REVIEWS.unshift(review)
  return review
}

// Static in-memory store — replaces PostgreSQL/Prisma.
//
// Everything lives in this module: categories, products (+ images & variants),
// a demo admin, and orders created at runtime (kept in memory for the life of
// the server process). Edit the data below to change the catalog — no database
// or migration needed.

import type { Category, Order, OrderItem, Product, ProductVariant, Voucher } from '@/types'
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
    id: 'cat-off-shoulder',
    name: 'Off Shoulder',
    slug: 'off-shoulder',
    description: 'Off-shoulder tops with a relaxed feminine fit',
    image: '/images/products/off shoulder/IMG_5635.JPG.jpeg',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'cat-sweatpants',
    name: 'Sweatpants',
    slug: 'sweatpants',
    description: 'Comfortable sweatpants with premium fit',
    image: '/images/products/sweatpants/IMG_5802.PNG',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'cat-round-neck',
    name: 'Crewneck',
    slug: 'round-neck',
    description: 'Classic crewneck sweatshirts for everyday wear',
    image: '/images/optimized/IMG_5546-card.webp',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'cat-knitwear',
    name: 'Knitwear',
    slug: 'knitwear',
    description: 'Premium knitwear with a soft, comfortable feel',
    image: '/images/optimized/IMG_5549-card.webp',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
]

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const COLORS = ['Black', 'White', 'Gray', 'Navy']

// Sizes come from the official size charts (see size-guide page):
// Off Shoulder → S/M/L, Sweatpants → M/L/XL, Crewneck → M/L/XL.

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

function buildVariants(productId: string, seed: number, sizes: string[]): ProductVariant[] {
  const variants: ProductVariant[] = []
  sizes.forEach((size, sizeIdx) => {
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

interface ProductImageSeed {
  /** Gallery (high-res) image URL. */
  url: string
  /** Optimized card image URL. */
  cardUrl: string
  /** Thumbnail URL. */
  thumbUrl: string
  alt: string
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
  sizes: string[]
  images: ProductImageSeed[]
}

// Each product is illustrated with the brand's own product photography.
// Primary image = first entry (shown by default), subsequent images appear on
// hover / in the product gallery.
const PRODUCT_SEEDS: ProductSeed[] = [
  // Off-Shoulder products using only the 3 images from the off shoulder folder with additional gallery images
  {
    id: 'prod-off-shoulder-01',
    name: 'Off Shoulder Signature Navy',
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
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5635.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5635.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5635.JPG.jpeg',
        alt: 'Off Shoulder Signature Navy - front view',
      },
      {
        url: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5636.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5636.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5636.JPG.jpeg',
        alt: 'Off Shoulder Signature Navy - side view',
      },
      {
        url: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5637.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5637.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5637.JPG.jpeg',
        alt: 'Off Shoulder Signature Navy - detail view',
      },
      {
        url: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5639.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5639.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-1/IMG_5639.JPG.jpeg',
        alt: 'Off Shoulder Signature Navy - back view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-02',
    name: 'Off Shoulder Essential Gray',
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
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5642.PNG',
        cardUrl: '/images/products/off shoulder/IMG_5642.PNG',
        thumbUrl: '/images/products/off shoulder/IMG_5642.PNG',
        alt: 'Off Shoulder Essential Gray - front view',
      },
      {
        url: '/images/products/off shoulder/off-shoulder-product-slide/image-2/IMG_5640.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-2/IMG_5640.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-2/IMG_5640.JPG.jpeg',
        alt: 'Off Shoulder Essential Gray - side view',
      },
      {
        url: '/images/products/off shoulder/off-shoulder-product-slide/image-2/IMG_5644.PNG',
        cardUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-2/IMG_5644.PNG',
        thumbUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-2/IMG_5644.PNG',
        alt: 'Off Shoulder Essential Gray - detail view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-03',
    name: 'Off Shoulder Street Style',
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
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5646.PNG',
        cardUrl: '/images/products/off shoulder/IMG_5646.PNG',
        thumbUrl: '/images/products/off shoulder/IMG_5646.PNG',
        alt: 'Off Shoulder Street Style - front view',
      },
      {
        url: '/images/products/off shoulder/off-shoulder-product-slide/image-3/IMG_5626.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-3/IMG_5626.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-3/IMG_5626.JPG.jpeg',
        alt: 'Off Shoulder Street Style - side view',
      },
      {
        url: '/images/products/off shoulder/off-shoulder-product-slide/image-3/IMG_5648.PNG',
        cardUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-3/IMG_5648.PNG',
        thumbUrl: '/images/products/off shoulder/off-shoulder-product-slide/image-3/IMG_5648.PNG',
        alt: 'Off Shoulder Street Style - detail view',
      },
    ],
  },
  // Sweatpants products using only the 2 images from the sweatpants folder with additional gallery images
  {
    id: 'prod-sweatpants-01',
    name: 'Signature Sweatpants',
    slug: 'sweatpants',
    description:
      'Comfortable sweatpants with drawstring waist and cuffed ankles. Size chart (hip × length): M 53 × 107 cm, L 56 × 110 cm, XL 60 × 113 cm.',
    price: 799,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: true,
    bestSeller: true,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5611.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5611.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5611.JPG.jpeg',
        alt: 'Signature Sweatpants - front view',
      },
      {
        url: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5581.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5581.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5581.JPG.jpeg',
        alt: 'Signature Sweatpants - side view',
      },
      {
        url: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5584.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5584.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5584.JPG.jpeg',
        alt: 'Signature Sweatpants - detail view',
      },
      {
        url: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5586.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5586.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5586.JPG.jpeg',
        alt: 'Signature Sweatpants - back view',
      },
      {
        url: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5587.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5587.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/sweatpants-product-slide/image-1/IMG_5587.JPG.jpeg',
        alt: 'Signature Sweatpants - lifestyle view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-02',
    name: 'Sweatpants Premium Edition',
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
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5802.PNG',
        cardUrl: '/images/products/sweatpants/IMG_5802.PNG',
        thumbUrl: '/images/products/sweatpants/IMG_5802.PNG',
        alt: 'Sweatpants Premium Edition - front view',
      },
      {
        url: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5590.PNG',
        cardUrl: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5590.PNG',
        thumbUrl: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5590.PNG',
        alt: 'Sweatpants Premium Edition - side view',
      },
      {
        url: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5591.PNG',
        cardUrl: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5591.PNG',
        thumbUrl: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5591.PNG',
        alt: 'Sweatpants Premium Edition - detail view',
      },
      {
        url: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5593.PNG',
        cardUrl: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5593.PNG',
        thumbUrl: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5593.PNG',
        alt: 'Sweatpants Premium Edition - back view',
      },
      {
        url: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5594.PNG',
        cardUrl: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5594.PNG',
        thumbUrl: '/images/products/sweatpants/sweatpants-product-slide/image-2/IMG_5594.PNG',
        alt: 'Sweatpants Premium Edition - lifestyle view',
      },
    ],
  },
  {
    id: 'prod-round-neck',
    name: 'Heavyweight Crewneck',
    slug: 'round-neck',
    description:
      'Classic crewneck sweatshirt with ribbed cuffs and hem. Size chart (length × width): M 67 × 63 cm, L 70 × 66 cm, XL 73 × 69 cm.',
    price: 849,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: true,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5544.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5544.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5544.JPG.jpeg',
        alt: 'Heavyweight Crewneck - front view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5545.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5545.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5545.JPG.jpeg',
        alt: 'Heavyweight Crewneck - side view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5549.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5549.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5549.JPG.jpeg',
        alt: 'Heavyweight Crewneck - detail view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5550.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5550.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5550.JPG.jpeg',
        alt: 'Heavyweight Crewneck - back view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5554.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5554.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide white/IMG_5554.JPG.jpeg',
        alt: 'Heavyweight Crewneck - lifestyle view',
      },
    ],
  },
  {
    id: 'prod-knitwear',
    name: 'Premium Knitwear',
    slug: 'knitwear',
    description:
      'Premium knitwear top with a soft feel and comfortable regular fit.',
    price: 750,
    salePrice: 600,
    categoryId: 'cat-knitwear',
    material: 'Soft Knit Fabric',
    fit: 'Regular',
    careInstructions: 'Machine wash cold, hang dry',
    featured: true,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/optimized/IMG_5549-gallery.webp',
        cardUrl: '/images/optimized/IMG_5549-card.webp',
        thumbUrl: '/images/optimized/IMG_5549-thumb.webp',
        alt: 'Premium Knitwear - front view',
      },
      {
        url: '/images/optimized/IMG_5550-gallery.webp',
        cardUrl: '/images/optimized/IMG_5550-card.webp',
        thumbUrl: '/images/optimized/IMG_5550-thumb.webp',
        alt: 'Premium Knitwear - back view',
      },
    ],
  },
  // Crewneck products using only the 5 images from the Crewnecks folder with additional gallery images
  {
    id: 'prod-crewneck-01',
    name: 'Crewneck Premium Gray',
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
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5557.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5557.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5557.JPG.jpeg',
        alt: 'Crewneck Premium Gray - front view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide pink/IMG_5526(1).jpg.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide pink/IMG_5526(1).jpg.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide pink/IMG_5526(1).jpg.jpeg',
        alt: 'Crewneck Premium Gray - alternate view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide pink/IMG_5618.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide pink/IMG_5618.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide pink/IMG_5618.JPG.jpeg',
        alt: 'Crewneck Premium Gray - lifestyle view',
      },
    ],
  },
  {
    id: 'prod-crewneck-02',
    name: 'Crewneck Street Style',
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
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5570.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5570.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5570.JPG.jpeg',
        alt: 'Crewneck Street Style - front view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5562.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5562.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5562.JPG.jpeg',
        alt: 'Crewneck Street Style - side view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5563.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5563.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5563.JPG.jpeg',
        alt: 'Crewneck Street Style - detail view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5571.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5571.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5571.JPG.jpeg',
        alt: 'Crewneck Street Style - back view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5574.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5574.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide black/IMG_5574.JPG.jpeg',
        alt: 'Crewneck Street Style - lifestyle view',
      },
    ],
  },
  {
    id: 'prod-crewneck-03',
    name: 'Crewneck Essential Gray',
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
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5608.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5608.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5608.JPG.jpeg',
        alt: 'Crewneck Essential Gray - front view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide burgundy/1000174031.jpg.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide burgundy/1000174031.jpg.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide burgundy/1000174031.jpg.jpeg',
        alt: 'Crewneck Essential Gray - alternate view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide burgundy/IMG_5599.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide burgundy/IMG_5599.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide burgundy/IMG_5599.JPG.jpeg',
        alt: 'Crewneck Essential Gray - detail view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide burgundy/IMG_5604.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide burgundy/IMG_5604.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide burgundy/IMG_5604.JPG.jpeg',
        alt: 'Crewneck Essential Gray - lifestyle view',
      },
    ],
  },
  {
    id: 'prod-crewneck-04',
    name: 'Crewneck Urban White',
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
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5617.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5617.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5617.JPG.jpeg',
        alt: 'Crewneck Urban White - front view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5526(2).jpg.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5526(2).jpg.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5526(2).jpg.jpeg',
        alt: 'Crewneck Urban White - side view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5546.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5546.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5546.JPG.jpeg',
        alt: 'Crewneck Urban White - detail view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5616.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5616.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5616.JPG.jpeg',
        alt: 'Crewneck Urban White - back view',
      },
      {
        url: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5622.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5622.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/crewnecks-product-slide blue/IMG_5622.JPG.jpeg',
        alt: 'Crewneck Urban White - lifestyle view',
      },
    ],
  },
]

function buildProduct(seed: ProductSeed, index: number): Product {
  const category = CATEGORIES.find((c) => c.id === seed.categoryId)!
  return {
    ...seed,
    active: true,
    category,
    images: seed.images.map((img, i) => ({
      id: `${seed.id}-img-${i + 1}`,
      productId: seed.id,
      url: img.url,
      cardUrl: img.cardUrl,
      thumbUrl: img.thumbUrl,
      alt: img.alt,
      sortOrder: i,
      createdAt: now(),
    })),
    variants: buildVariants(seed.id, index * 5 + 3, seed.sizes),
    createdAt: now(),
    updatedAt: now(),
  }
}

// Mutable so admin CRUD and checkout stock updates work in-memory.
export const PRODUCTS: Product[] = PRODUCT_SEEDS.map((seed, i) => buildProduct(seed, i))

// ---------------------------------------------------------------------------
// Vouchers (in-memory — discount codes customers apply at checkout.
// Manage from Admin → Vouchers. Codes are case-insensitive.)
// ---------------------------------------------------------------------------

export const VOUCHERS: Voucher[] = [
  {
    id: 'voucher-welcome10',
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    minSubtotal: null,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'voucher-unique50',
    code: 'UNIQUE50',
    type: 'fixed',
    value: 50,
    minSubtotal: 500,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
]

export function normalizeVoucherCode(code: string): string {
  return code.trim().toUpperCase()
}

export function getVoucherByCode(code: string): Voucher | undefined {
  const normalized = normalizeVoucherCode(code)
  if (!normalized) return undefined
  return VOUCHERS.find((v) => v.code === normalized)
}

export interface VoucherValidation {
  ok: boolean
  voucher?: Voucher
  discount?: number
  error?: 'NOT_FOUND' | 'INACTIVE' | 'MIN_SUBTOTAL'
  minSubtotal?: number
}

/** Validate a code against the current subtotal and compute the discount. */
export function validateVoucher(code: string, subtotal: number): VoucherValidation {
  const voucher = getVoucherByCode(code)
  if (!voucher) return { ok: false, error: 'NOT_FOUND' }
  if (!voucher.active) return { ok: false, error: 'INACTIVE' }
  if (voucher.minSubtotal !== null && subtotal < voucher.minSubtotal) {
    return { ok: false, error: 'MIN_SUBTOTAL', minSubtotal: voucher.minSubtotal }
  }
  const raw = voucher.type === 'percent' ? (subtotal * voucher.value) / 100 : voucher.value
  // Discount can never exceed the subtotal (total floors at 0).
  const discount = Math.min(Math.max(0, Math.floor(raw)), Math.max(0, subtotal))
  return { ok: true, voucher, discount }
}

export interface AdminVoucherInput {
  code: string
  type: 'percent' | 'fixed'
  value: number
  minSubtotal?: number | null
  active?: boolean
}

export function createVoucher(input: AdminVoucherInput): Voucher {
  const voucher: Voucher = {
    id: `voucher-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    code: normalizeVoucherCode(input.code),
    type: input.type,
    value: input.value,
    minSubtotal: input.minSubtotal ?? null,
    active: input.active ?? true,
    createdAt: now(),
    updatedAt: now(),
  }
  VOUCHERS.unshift(voucher)
  return voucher
}

export function updateVoucher(id: string, data: Partial<AdminVoucherInput>): Voucher | undefined {
  const voucher = VOUCHERS.find((v) => v.id === id)
  if (!voucher) return undefined
  if (data.code !== undefined) voucher.code = normalizeVoucherCode(data.code)
  if (data.type !== undefined) voucher.type = data.type
  if (data.value !== undefined) voucher.value = data.value
  if (data.minSubtotal !== undefined) voucher.minSubtotal = data.minSubtotal
  if (data.active !== undefined) voucher.active = data.active
  voucher.updatedAt = new Date()
  return voucher
}

export function deleteVoucher(id: string): boolean {
  const index = VOUCHERS.findIndex((v) => v.id === id)
  if (index === -1) return false
  VOUCHERS.splice(index, 1)
  return true
}

// ---------------------------------------------------------------------------
// Orders (in-memory — created via checkout, visible in admin for this run)
// ---------------------------------------------------------------------------

const ORDERS: Order[] = []

export interface CreateOrderInput {
  customerName: string
  phone: string
  secondaryPhone?: string
  email: string
  address: string
  city: string
  apartment?: string
  notes?: string
  voucherCode?: string
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

  // Voucher is re-validated server-side — the client total is never trusted.
  let voucherCode: string | null = null
  let discountAmount = 0
  const rawCode = (input.voucherCode ?? '').trim()
  if (rawCode) {
    const validation = validateVoucher(rawCode, subtotal)
    if (!validation.ok) {
      throw new Error(`Invalid voucher: ${validation.error}`)
    }
    voucherCode = validation.voucher!.code
    discountAmount = validation.discount ?? 0
  }

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
    voucherCode,
    discountAmount,
    total: subtotal - discountAmount,
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
  subtotal: number
  voucherCode: string | null
  discountAmount: number
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
    subtotal: order.subtotal,
    voucherCode: order.voucherCode,
    discountAmount: order.discountAmount,
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
  newArrivals?: boolean
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

  if (query.newArrivals) {
    result = result.filter((p) => p.newArrival)
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
      products: PRODUCTS.filter((p) => p.categoryId === category.id).length,
    },
  }))
}

// ---------------------------------------------------------------------------
// Product CRUD operations (for admin)
// ---------------------------------------------------------------------------

export interface AdminProductInput {
  name: string
  slug: string
  description?: string
  price: number
  salePrice?: number | null
  categoryId: string
  material?: string
  fit?: string
  careInstructions?: string
  featured?: boolean
  bestSeller?: boolean
  newArrival?: boolean
  active?: boolean
  images?: { url: string; cardUrl?: string; thumbUrl?: string; alt?: string }[]
  variants?: { size: string; color: string; stock: number }[]
}

export function createProduct(input: AdminProductInput): Product {
  const category = CATEGORIES.find((c) => c.id === input.categoryId)
  if (!category) {
    throw new Error('Category not found')
  }

  const productId = `prod-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

  const images = (input.images || []).map((img, i) => ({
    id: `${productId}-img-${i + 1}`,
    productId,
    url: img.url,
    cardUrl: img.cardUrl || img.url,
    thumbUrl: img.thumbUrl || img.url,
    alt: img.alt || input.name,
    sortOrder: i,
    createdAt: now(),
  }))

  const sizes = input.variants?.map((v) => v.size) || ['M', 'L', 'XL']
  const variants = buildVariants(productId, 0, sizes)

  // Override stock if provided in input
  if (input.variants) {
    input.variants.forEach((inputVariant) => {
      const variant = variants.find(
        (v) => v.size === inputVariant.size && v.color === inputVariant.color
      )
      if (variant) {
        variant.stock = inputVariant.stock
      }
    })
  }

  const product: Product = {
    id: productId,
    name: input.name,
    slug: input.slug,
    description: input.description ?? '',
    price: input.price,
    salePrice: input.salePrice ?? null,
    categoryId: input.categoryId,
    material: input.material ?? '100% Cotton',
    fit: input.fit ?? 'Relaxed',
    careInstructions: input.careInstructions ?? 'Machine wash cold',
    featured: input.featured || false,
    bestSeller: input.bestSeller || false,
    newArrival: input.newArrival || false,
    active: input.active !== false,
    sizes,
    images,
    variants,
    category,
    createdAt: now(),
    updatedAt: now(),
  }

  PRODUCTS.unshift(product)
  return product
}

export function updateProduct(id: string, data: Partial<AdminProductInput>): Product | undefined {
  const product = PRODUCTS.find((p) => p.id === id)
  if (!product) return undefined

  if (data.name !== undefined) product.name = data.name
  if (data.slug !== undefined) product.slug = data.slug
  if (data.description !== undefined) product.description = data.description
  if (data.price !== undefined) product.price = data.price
  if (data.salePrice !== undefined) product.salePrice = data.salePrice
  if (data.categoryId !== undefined) {
    const category = CATEGORIES.find((c) => c.id === data.categoryId)
    if (category) {
      product.categoryId = data.categoryId
      product.category = category
    }
  }
  if (data.material !== undefined) product.material = data.material
  if (data.fit !== undefined) product.fit = data.fit
  if (data.careInstructions !== undefined) product.careInstructions = data.careInstructions
  if (data.featured !== undefined) product.featured = data.featured
  if (data.bestSeller !== undefined) product.bestSeller = data.bestSeller
  if (data.newArrival !== undefined) product.newArrival = data.newArrival
  if (data.active !== undefined) product.active = data.active
  if (data.variants !== undefined) {
    data.variants.forEach((inputVariant) => {
      const variant = product.variants.find(
        (v) => v.size === inputVariant.size && v.color === inputVariant.color
      )
      if (variant) {
        variant.stock = inputVariant.stock
      }
    })
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

// ---------------------------------------------------------------------------
// Reviews (in-memory — product reviews submitted by customers)
// ---------------------------------------------------------------------------

export interface Review {
  id: string
  productId: string
  customerName: string
  rating: number
  comment: string
  createdAt: Date
}

const REVIEWS: Review[] = []

export interface ReviewInput {
  productId: string
  customerName: string
  rating: number
  comment: string
}

export function addReview(input: ReviewInput): Review {
  const review: Review = {
    id: `review-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    productId: input.productId,
    customerName: input.customerName,
    rating: input.rating,
    comment: input.comment,
    createdAt: new Date(),
  }
  REVIEWS.unshift(review)
  return review
}

export function getProductReviews(productId: string): Review[] {
  return REVIEWS.filter((r) => r.productId === productId)
}

export interface RatingSummary {
  average: number
  count: number
  distribution: { rating: number; count: number }[]
}

export function getRatingSummary(productId: string): RatingSummary {
  const reviews = REVIEWS.filter((r) => r.productId === productId)
  const count = reviews.length

  if (count === 0) {
    return {
      average: 0,
      count: 0,
      distribution: [
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ],
    }
  }

  const total = reviews.reduce((sum, r) => sum + r.rating, 0)
  const average = total / count

  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }))

  return {
    average: Math.round(average * 10) / 10,
    count,
    distribution,
  }
}

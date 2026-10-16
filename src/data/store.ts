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
    image: '/images/products/off shoulder/IMG_5624.JPG.jpeg',
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'cat-sweatpants',
    name: 'Sweatpants',
    slug: 'sweatpants',
    description: 'Comfortable sweatpants with premium fit',
    image: '/images/products/sweatpants/IMG_5579.JPG.jpeg',
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
  // Off-Shoulder products displaying all images from the off shoulder folder
  {
    id: 'prod-off-shoulder-01',
    name: 'Off Shoulder Classic Black',
    slug: 'off-shoulder-classic-black',
    description: 'Classic black off-shoulder top with ribbed cuffs and hem.',
    price: 850,
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
        url: '/images/products/off shoulder/IMG_5624.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5624.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5624.JPG.jpeg',
        alt: 'Off Shoulder Classic Black - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-02',
    name: 'Off Shoulder Essential White',
    slug: 'off-shoulder-essential-white',
    description: 'Essential white off-shoulder top with clean design.',
    price: 850,
    salePrice: 765,
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
        url: '/images/products/off shoulder/IMG_5624.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5624.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5624.JPG.jpeg',
        alt: 'Off Shoulder Classic Black - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-03',
    name: 'Off Shoulder Essential White',
    slug: 'off-shoulder-essential-white',
    description: 'Essential white off-shoulder top with clean design.',
    price: 850,
    salePrice: 765,
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
        url: '/images/products/off shoulder/IMG_5626.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5626.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5626.JPG.jpeg',
        alt: 'Off Shoulder Essential White - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-04',
    name: 'Off Shoulder Graphic Edition',
    slug: 'off-shoulder-graphic',
    description: 'Graphic edition off-shoulder top with unique design.',
    price: 950,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5627.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5627.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5627.JPG.jpeg',
        alt: 'Off Shoulder Graphic Edition - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-05',
    name: 'Off Shoulder Street Edition',
    slug: 'off-shoulder-street',
    description: 'Street edition off-shoulder top with urban design.',
    price: 900,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5630.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5630.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5630.JPG.jpeg',
        alt: 'Off Shoulder Street Edition - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-06',
    name: 'Off Shoulder Premium Gray',
    slug: 'off-shoulder-premium-gray',
    description: 'Premium gray off-shoulder top with heavyweight fabric.',
    price: 875,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5633.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5633.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5633.JPG.jpeg',
        alt: 'Off Shoulder Premium Gray - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-07',
    name: 'Off Shoulder Signature Navy',
    slug: 'off-shoulder-signature-navy',
    description: 'Signature navy off-shoulder top with premium quality.',
    price: 875,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5635.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5635.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5635.JPG.jpeg',
        alt: 'Off Shoulder Signature Navy - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-08',
    name: 'Off Shoulder Essential Beige',
    slug: 'off-shoulder-essential-beige',
    description: 'Essential beige off-shoulder top with soft fabric.',
    price: 850,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5636.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5636.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5636.JPG.jpeg',
        alt: 'Off Shoulder Essential Beige - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-09',
    name: 'Off Shoulder Premium Olive',
    slug: 'off-shoulder-premium-olive',
    description: 'Premium olive off-shoulder top with earth-tone styling.',
    price: 875,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5637.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5637.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5637.JPG.jpeg',
        alt: 'Off Shoulder Premium Olive - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-10',
    name: 'Off Shoulder Urban Edition',
    slug: 'off-shoulder-urban',
    description: 'Urban edition off-shoulder top with contemporary design.',
    price: 900,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5638.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5638.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5638.JPG.jpeg',
        alt: 'Off Shoulder Urban Edition - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-11',
    name: 'Off Shoulder Classic Edition',
    slug: 'off-shoulder-classic',
    description: 'Classic edition off-shoulder top with timeless design.',
    price: 850,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5639.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5639.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5639.JPG.jpeg',
        alt: 'Off Shoulder Classic Edition - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-12',
    name: 'Off Shoulder Modern Fit',
    slug: 'off-shoulder-modern-fit',
    description: 'Modern fit off-shoulder top with contemporary styling.',
    price: 875,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5640.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5640.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5640.JPG.jpeg',
        alt: 'Off Shoulder Modern Fit - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-13',
    name: 'Off Shoulder Essential Gray',
    slug: 'off-shoulder-essential-gray',
    description: 'Essential gray off-shoulder top with premium quality.',
    price: 850,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5641.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5641.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5641.JPG.jpeg',
        alt: 'Off Shoulder Essential Gray - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-14',
    name: 'Off Shoulder Premium Black',
    slug: 'off-shoulder-premium-black',
    description: 'Premium black off-shoulder top with heavyweight fabric.',
    price: 900,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5642.PNG',
        cardUrl: '/images/products/off shoulder/IMG_5642.PNG',
        thumbUrl: '/images/products/off shoulder/IMG_5642.PNG',
        alt: 'Off Shoulder Premium Black - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-15',
    name: 'Off Shoulder Street Style',
    slug: 'off-shoulder-street-style',
    description: 'Street style off-shoulder top with urban design.',
    price: 925,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5644.PNG',
        cardUrl: '/images/products/off shoulder/IMG_5644.PNG',
        thumbUrl: '/images/products/off shoulder/IMG_5644.PNG',
        alt: 'Off Shoulder Street Style - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-16',
    name: 'Off Shoulder Urban Design',
    slug: 'off-shoulder-urban-design',
    description: 'Urban design off-shoulder top with modern aesthetics.',
    price: 925,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5646.PNG',
        cardUrl: '/images/products/off shoulder/IMG_5646.PNG',
        thumbUrl: '/images/products/off shoulder/IMG_5646.PNG',
        alt: 'Off Shoulder Urban Design - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-17',
    name: 'Off Shoulder Contemporary',
    slug: 'off-shoulder-contemporary',
    description: 'Contemporary off-shoulder top with clean lines.',
    price: 875,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5648.PNG',
        cardUrl: '/images/products/off shoulder/IMG_5648.PNG',
        thumbUrl: '/images/products/off shoulder/IMG_5648.PNG',
        alt: 'Off Shoulder Contemporary - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-18',
    name: 'Off Shoulder Essential Navy',
    slug: 'off-shoulder-essential-navy',
    description: 'Essential navy off-shoulder top with premium fabric.',
    price: 875,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5649.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5649.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5649.JPG.jpeg',
        alt: 'Off Shoulder Essential Navy - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-19',
    name: 'Off Shoulder Premium Edition',
    slug: 'off-shoulder-premium-edition',
    description: 'Premium edition off-shoulder top with exclusive design.',
    price: 950,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5650.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5650.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5650.JPG.jpeg',
        alt: 'Off Shoulder Premium Edition - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-20',
    name: 'Off Shoulder Signature Black',
    slug: 'off-shoulder-signature-black',
    description: 'Signature black off-shoulder top with premium quality.',
    price: 900,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5653.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5653.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5653.JPG.jpeg',
        alt: 'Off Shoulder Signature Black - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-21',
    name: 'Off Shoulder Essential White v2',
    slug: 'off-shoulder-essential-white-v2',
    description: 'Essential white off-shoulder v2 with enhanced fabric.',
    price: 850,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5654.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5654.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5654.JPG.jpeg',
        alt: 'Off Shoulder Essential White v2 - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-22',
    name: 'Off Shoulder Modern Gray',
    slug: 'off-shoulder-modern-gray',
    description: 'Modern gray off-shoulder top with contemporary fit.',
    price: 875,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/IMG_5655.JPG.jpeg',
        cardUrl: '/images/products/off shoulder/IMG_5655.JPG.jpeg',
        thumbUrl: '/images/products/off shoulder/IMG_5655.JPG.jpeg',
        alt: 'Off Shoulder Modern Gray - front view',
      },
    ],
  },
  {
    id: 'prod-off-shoulder-23',
    name: 'Off Shoulder Exclusive Edition',
    slug: 'off-shoulder-exclusive',
    description: 'Exclusive edition off-shoulder top with special design.',
    price: 950,
    salePrice: null,
    categoryId: 'cat-off-shoulder',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed Off-Shoulder',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['S', 'M', 'L'],
    images: [
      {
        url: '/images/products/off shoulder/WhatsApp Image 2026-10-15 at 7.08.48 AM.jpeg',
        cardUrl: '/images/products/off shoulder/WhatsApp Image 2026-10-15 at 7.08.48 AM.jpeg',
        thumbUrl: '/images/products/off shoulder/WhatsApp Image 2026-10-15 at 7.08.48 AM.jpeg',
        alt: 'Off Shoulder Exclusive Edition - front view',
      },
    ],
  },
  // Sweatpants products displaying all images from the sweatpants folder
  {
    id: 'prod-sweatpants-01',
    name: 'Signature Sweatpants',
    slug: 'sweatpants',
    description:
      'Comfortable sweatpants with drawstring waist and cuffed ankles. Size chart (hip × length): M 53 × 107 cm, L 56 × 110 cm, XL 60 × 113 cm.',
    price: 650,
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
        url: '/images/products/sweatpants/IMG_5579.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5579.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5579.JPG.jpeg',
        alt: 'Signature Sweatpants - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-02',
    name: 'Sweatpants Classic Black',
    slug: 'sweatpants-classic-black',
    description: 'Classic black sweatpants with drawstring waist.',
    price: 650,
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
        url: '/images/products/sweatpants/IMG_5580.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5580.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5580.JPG.jpeg',
        alt: 'Sweatpants Classic Black - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-03',
    name: 'Sweatpants Essential Gray',
    slug: 'sweatpants-essential-gray',
    description: 'Essential gray sweatpants with premium fabric.',
    price: 650,
    salePrice: 585,
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
        url: '/images/products/sweatpants/IMG_5581.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5581.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5581.JPG.jpeg',
        alt: 'Sweatpants Essential Gray - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-04',
    name: 'Sweatpants Street Edition',
    slug: 'sweatpants-street',
    description: 'Street edition sweatpants with urban design.',
    price: 700,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5582.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5582.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5582.JPG.jpeg',
        alt: 'Sweatpants Street Edition - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-05',
    name: 'Sweatpants Premium Navy',
    slug: 'sweatpants-premium-navy',
    description: 'Premium navy sweatpants with heavyweight fabric.',
    price: 675,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5583.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5583.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5583.JPG.jpeg',
        alt: 'Sweatpants Premium Navy - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-06',
    name: 'Sweatpants Essential Black',
    slug: 'sweatpants-essential-black',
    description: 'Essential black sweatpants with clean design.',
    price: 650,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5584.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5584.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5584.JPG.jpeg',
        alt: 'Sweatpants Essential Black - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-07',
    name: 'Sweatpants Signature Gray',
    slug: 'sweatpants-signature-gray',
    description: 'Signature gray sweatpants with premium quality.',
    price: 675,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5586.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5586.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5586.JPG.jpeg',
        alt: 'Sweatpants Signature Gray - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-08',
    name: 'Sweatpants Urban Edition',
    slug: 'sweatpants-urban',
    description: 'Urban edition sweatpants with contemporary design.',
    price: 700,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5587.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5587.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5587.JPG.jpeg',
        alt: 'Sweatpants Urban Edition - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-09',
    name: 'Sweatpants Modern Fit',
    slug: 'sweatpants-modern-fit',
    description: 'Modern fit sweatpants with contemporary styling.',
    price: 675,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5589.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5589.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5589.JPG.jpeg',
        alt: 'Sweatpants Modern Fit - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-10',
    name: 'Sweatpants Premium Black',
    slug: 'sweatpants-premium-black',
    description: 'Premium black sweatpants with heavyweight fabric.',
    price: 700,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5590.PNG',
        cardUrl: '/images/products/sweatpants/IMG_5590.PNG',
        thumbUrl: '/images/products/sweatpants/IMG_5590.PNG',
        alt: 'Sweatpants Premium Black - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-11',
    name: 'Sweatpants Street Style',
    slug: 'sweatpants-street-style',
    description: 'Street style sweatpants with urban design.',
    price: 725,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5591.PNG',
        cardUrl: '/images/products/sweatpants/IMG_5591.PNG',
        thumbUrl: '/images/products/sweatpants/IMG_5591.PNG',
        alt: 'Sweatpants Street Style - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-12',
    name: 'Sweatpants Urban Design',
    slug: 'sweatpants-urban-design',
    description: 'Urban design sweatpants with modern aesthetics.',
    price: 725,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5592.PNG',
        cardUrl: '/images/products/sweatpants/IMG_5592.PNG',
        thumbUrl: '/images/products/sweatpants/IMG_5592.PNG',
        alt: 'Sweatpants Urban Design - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-13',
    name: 'Sweatpants Contemporary',
    slug: 'sweatpants-contemporary',
    description: 'Contemporary sweatpants with clean lines.',
    price: 675,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5593.PNG',
        cardUrl: '/images/products/sweatpants/IMG_5593.PNG',
        thumbUrl: '/images/products/sweatpants/IMG_5593.PNG',
        alt: 'Sweatpants Contemporary - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-14',
    name: 'Sweatpants Essential Navy',
    slug: 'sweatpants-essential-navy',
    description: 'Essential navy sweatpants with premium fabric.',
    price: 675,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5594.PNG',
        cardUrl: '/images/products/sweatpants/IMG_5594.PNG',
        thumbUrl: '/images/products/sweatpants/IMG_5594.PNG',
        alt: 'Sweatpants Essential Navy - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-15',
    name: 'Sweatpants Premium Edition',
    slug: 'sweatpants-premium-edition',
    description: 'Premium edition sweatpants with exclusive design.',
    price: 750,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5595.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5595.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5595.JPG.jpeg',
        alt: 'Sweatpants Premium Edition - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-16',
    name: 'Sweatpants Signature Black',
    slug: 'sweatpants-signature-black',
    description: 'Signature black sweatpants with premium quality.',
    price: 700,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5596.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5596.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5596.JPG.jpeg',
        alt: 'Sweatpants Signature Black - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-17',
    name: 'Sweatpants Essential White',
    slug: 'sweatpants-essential-white',
    description: 'Essential white sweatpants with clean design.',
    price: 650,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/IMG_5611.JPG.jpeg',
        cardUrl: '/images/products/sweatpants/IMG_5611.JPG.jpeg',
        thumbUrl: '/images/products/sweatpants/IMG_5611.JPG.jpeg',
        alt: 'Sweatpants Essential White - front view',
      },
    ],
  },
  {
    id: 'prod-sweatpants-18',
    name: 'Sweatpants Exclusive Edition',
    slug: 'sweatpants-exclusive',
    description: 'Exclusive edition sweatpants with special design.',
    price: 750,
    salePrice: null,
    categoryId: 'cat-sweatpants',
    material: '80% Cotton, 20% Polyester',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, tumble dry low',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/sweatpants/WhatsApp Image 2026-10-15 at 7.08.24 AM.jpeg',
        cardUrl: '/images/products/sweatpants/WhatsApp Image 2026-10-15 at 7.08.24 AM.jpeg',
        thumbUrl: '/images/products/sweatpants/WhatsApp Image 2026-10-15 at 7.08.24 AM.jpeg',
        alt: 'Sweatpants Exclusive Edition - front view',
      },
    ],
  },
  {
    id: 'prod-round-neck',
    name: 'Heavyweight Crewneck',
    slug: 'round-neck',
    description:
      'Classic crewneck sweatshirt with ribbed cuffs and hem. Size chart (length × width): M 67 × 63 cm, L 70 × 66 cm, XL 73 × 69 cm.',
    price: 750,
    salePrice: 600,
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
        url: '/images/optimized/IMG_5546-gallery.webp',
        cardUrl: '/images/optimized/IMG_5546-card.webp',
        thumbUrl: '/images/optimized/IMG_5546-thumb.webp',
        alt: 'Heavyweight Crewneck - front view',
      },
      {
        url: '/images/optimized/IMG_5548-gallery.webp',
        cardUrl: '/images/optimized/IMG_5548-card.webp',
        thumbUrl: '/images/optimized/IMG_5548-thumb.webp',
        alt: 'Heavyweight Crewneck - detail view',
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
  // Additional Crewneck products to display all images from the Crewnecks folder
  {
    id: 'prod-crewneck-02',
    name: 'Crewneck Classic Black',
    slug: 'crewneck-classic-black',
    description: 'Classic black crewneck sweatshirt with heavyweight cotton construction.',
    price: 750,
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
        url: '/images/products/Crewnecks/IMG_5553.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5553.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5553.JPG.jpeg',
        alt: 'Crewneck Classic Black - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-03',
    name: 'Crewneck Essential White',
    slug: 'crewneck-essential-white',
    description: 'Essential white crewneck with clean design and premium fabric.',
    price: 750,
    salePrice: 675,
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
        url: '/images/products/Crewnecks/IMG_5554.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5554.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5554.JPG.jpeg',
        alt: 'Crewneck Essential White - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-04',
    name: 'Crewneck Graphic Edition',
    slug: 'crewneck-graphic',
    description: 'Graphic edition crewneck with unique design elements.',
    price: 850,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5555.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5555.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5555.JPG.jpeg',
        alt: 'Crewneck Graphic Edition - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-05',
    name: 'Crewneck Street Edition',
    slug: 'crewneck-street',
    description: 'Street edition crewneck with urban-inspired design.',
    price: 800,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5556.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5556.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5556.JPG.jpeg',
        alt: 'Crewneck Street Edition - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-06',
    name: 'Crewneck Premium Gray',
    slug: 'crewneck-premium-gray',
    description: 'Premium gray crewneck with heavyweight fabric.',
    price: 775,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5557.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5557.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5557.JPG.jpeg',
        alt: 'Crewneck Premium Gray - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-07',
    name: 'Crewneck Signature Navy',
    slug: 'crewneck-signature-navy',
    description: 'Signature navy crewneck with premium quality cotton.',
    price: 775,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5558.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5558.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5558.JPG.jpeg',
        alt: 'Crewneck Signature Navy - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-08',
    name: 'Crewneck Essential Beige',
    slug: 'crewneck-essential-beige',
    description: 'Essential beige crewneck with soft, comfortable fabric.',
    price: 750,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5559.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5559.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5559.JPG.jpeg',
        alt: 'Crewneck Essential Beige - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-09',
    name: 'Crewneck Premium Olive',
    slug: 'crewneck-premium-olive',
    description: 'Premium olive crewneck with earth-tone styling.',
    price: 775,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5621.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5621.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5621.JPG.jpeg',
        alt: 'Crewneck Premium Olive - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-10',
    name: 'Crewneck Urban Edition',
    slug: 'crewneck-urban',
    description: 'Urban edition crewneck with contemporary design.',
    price: 800,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5622.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5622.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5622.JPG.jpeg',
        alt: 'Crewneck Urban Edition - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-11',
    name: 'Crewneck Classic Edition',
    slug: 'crewneck-classic',
    description: 'Classic edition crewneck with timeless design.',
    price: 750,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5623.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5623.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5623.JPG.jpeg',
        alt: 'Crewneck Classic Edition - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-12',
    name: 'Crewneck Modern Fit',
    slug: 'crewneck-modern-fit',
    description: 'Modern fit crewneck with contemporary styling.',
    price: 775,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5562.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5562.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5562.JPG.jpeg',
        alt: 'Crewneck Modern Fit - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-13',
    name: 'Crewneck Essential Gray',
    slug: 'crewneck-essential-gray',
    description: 'Essential gray crewneck with premium quality.',
    price: 750,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5563.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5563.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5563.JPG.jpeg',
        alt: 'Crewneck Essential Gray - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-14',
    name: 'Crewneck Premium Black',
    slug: 'crewneck-premium-black',
    description: 'Premium black crewneck with heavyweight fabric.',
    price: 800,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5564.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5564.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5564.JPG.jpeg',
        alt: 'Crewneck Premium Black - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-15',
    name: 'Crewneck Street Style',
    slug: 'crewneck-street-style',
    description: 'Street style crewneck with urban design.',
    price: 825,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5570.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5570.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5570.JPG.jpeg',
        alt: 'Crewneck Street Style - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-16',
    name: 'Crewneck Urban Design',
    slug: 'crewneck-urban-design',
    description: 'Urban design crewneck with modern aesthetics.',
    price: 825,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5571.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5571.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5571.JPG.jpeg',
        alt: 'Crewneck Urban Design - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-17',
    name: 'Crewneck Contemporary',
    slug: 'crewneck-contemporary',
    description: 'Contemporary crewneck with clean lines.',
    price: 775,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5572.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5572.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5572.JPG.jpeg',
        alt: 'Crewneck Contemporary - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-18',
    name: 'Crewneck Essential Navy',
    slug: 'crewneck-essential-navy',
    description: 'Essential navy crewneck with premium fabric.',
    price: 775,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5574.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5574.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5574.JPG.jpeg',
        alt: 'Crewneck Essential Navy - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-19',
    name: 'Crewneck Premium Edition',
    slug: 'crewneck-premium-edition',
    description: 'Premium edition crewneck with exclusive design.',
    price: 850,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5599.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5599.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5599.JPG.jpeg',
        alt: 'Crewneck Premium Edition - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-20',
    name: 'Crewneck Signature Black',
    slug: 'crewneck-signature-black',
    description: 'Signature black crewneck with premium quality.',
    price: 800,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5600.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5600.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5600.JPG.jpeg',
        alt: 'Crewneck Signature Black - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-21',
    name: 'Crewneck Essential White',
    slug: 'crewneck-essential-white-v2',
    description: 'Essential white crewneck v2 with enhanced fabric.',
    price: 750,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5601.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5601.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5601.JPG.jpeg',
        alt: 'Crewneck Essential White v2 - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-22',
    name: 'Crewneck Modern Gray',
    slug: 'crewneck-modern-gray',
    description: 'Modern gray crewneck with contemporary fit.',
    price: 775,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5602.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5602.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5602.JPG.jpeg',
        alt: 'Crewneck Modern Gray - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-23',
    name: 'Crewneck Premium Navy v2',
    slug: 'crewneck-premium-navy-v2',
    description: 'Premium navy crewneck v2 with enhanced quality.',
    price: 800,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5603.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5603.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5603.JPG.jpeg',
        alt: 'Crewneck Premium Navy v2 - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-24',
    name: 'Crewneck Urban Black',
    slug: 'crewneck-urban-black',
    description: 'Urban black crewneck with street style.',
    price: 825,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5604.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5604.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5604.JPG.jpeg',
        alt: 'Crewneck Urban Black - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-25',
    name: 'Crewneck Essential Gray v2',
    slug: 'crewneck-essential-gray-v2',
    description: 'Essential gray crewneck v2 with premium fabric.',
    price: 775,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5608.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5608.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5608.JPG.jpeg',
        alt: 'Crewneck Essential Gray v2 - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-26',
    name: 'Crewneck Signature Gray',
    slug: 'crewneck-signature-gray',
    description: 'Signature gray crewneck with exclusive styling.',
    price: 800,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5609.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5609.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5609.JPG.jpeg',
        alt: 'Crewneck Signature Gray - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-27',
    name: 'Crewneck Premium White',
    slug: 'crewneck-premium-white',
    description: 'Premium white crewneck with heavyweight fabric.',
    price: 775,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5610.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5610.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5610.JPG.jpeg',
        alt: 'Crewneck Premium White - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-28',
    name: 'Crewneck Street Edition v2',
    slug: 'crewneck-street-v2',
    description: 'Street edition crewneck v2 with urban design.',
    price: 825,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5612.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5612.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5612.JPG.jpeg',
        alt: 'Crewneck Street Edition v2 - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-29',
    name: 'Crewneck Modern Navy',
    slug: 'crewneck-modern-navy',
    description: 'Modern navy crewneck with contemporary design.',
    price: 800,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5613.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5613.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5613.JPG.jpeg',
        alt: 'Crewneck Modern Navy - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-30',
    name: 'Crewneck Premium Black v2',
    slug: 'crewneck-premium-black-v2',
    description: 'Premium black crewneck v2 with enhanced quality.',
    price: 850,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5615.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5615.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5615.JPG.jpeg',
        alt: 'Crewneck Premium Black v2 - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-31',
    name: 'Crewneck Essential Black v2',
    slug: 'crewneck-essential-black-v2',
    description: 'Essential black crewneck v2 with premium fabric.',
    price: 775,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5616.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5616.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5616.JPG.jpeg',
        alt: 'Crewneck Essential Black v2 - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-32',
    name: 'Crewneck Urban White',
    slug: 'crewneck-urban-white',
    description: 'Urban white crewneck with street style.',
    price: 800,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5617.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5617.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5617.JPG.jpeg',
        alt: 'Crewneck Urban White - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-33',
    name: 'Crewneck Signature White',
    slug: 'crewneck-signature-white',
    description: 'Signature white crewneck with exclusive design.',
    price: 825,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5618.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5618.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5618.JPG.jpeg',
        alt: 'Crewneck Signature White - front view',
      },
    ],
  },
  {
    id: 'prod-crewneck-34',
    name: 'Crewneck Premium Gray v2',
    slug: 'crewneck-premium-gray-v2',
    description: 'Premium gray crewneck v2 with enhanced quality.',
    price: 800,
    salePrice: null,
    categoryId: 'cat-round-neck',
    material: '100% Heavyweight Cotton',
    fit: 'Relaxed',
    careInstructions: 'Machine wash cold, hang dry',
    featured: false,
    bestSeller: false,
    newArrival: true,
    sizes: ['M', 'L', 'XL'],
    images: [
      {
        url: '/images/products/Crewnecks/IMG_5619.JPG.jpeg',
        cardUrl: '/images/products/Crewnecks/IMG_5619.JPG.jpeg',
        thumbUrl: '/images/products/Crewnecks/IMG_5619.JPG.jpeg',
        alt: 'Crewneck Premium Gray v2 - front view',
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

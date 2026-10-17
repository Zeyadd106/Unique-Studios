export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  categoryId: string
  category: Category
  material: string | null
  fit: string | null
  careInstructions: string | null
  featured: boolean
  bestSeller: boolean
  newArrival: boolean
  active: boolean
  sizes: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  id: string
  productId: string
  /** High-resolution image used for the product gallery / main view. */
  url: string
  /** Smaller optimized image used in product cards. */
  cardUrl?: string
  /** Thumbnail used in gallery thumbnail strips. */
  thumbUrl?: string
  alt: string | null
  sortOrder: number
  isPrimary?: boolean
  createdAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  size: string
  color: string
  stock: number
  weightMin: number | null
  weightMax: number | null
  createdAt: Date
  updatedAt: Date
}

export interface Voucher {
  id: string
  code: string
  type: 'percent' | 'fixed'
  /** Percent (e.g. 10 = 10%) or fixed EGP amount. */
  value: number
  /** Minimum order subtotal (EGP) required. Null = no minimum. */
  minSubtotal: number | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  phone: string
  secondaryPhone: string | null
  email: string
  address: string
  city: string
  apartment: string | null
  notes: string | null
    paymentMethod: string
    status: string
    subtotal: number
    voucherCode: string | null
    discountAmount: number
    total: number
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {  id: string
  orderId: string
  productId: string
  productName: string
  size: string
  color: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
}

export interface CartItem {
  productId: string
  productName: string
  productSlug: string
  image: string
  size: string
  color: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Admin {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface DashboardStats {
  totalOrders: number
  newOrders: number
  confirmedOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  totalProducts: number
  lowStockProducts: number
}
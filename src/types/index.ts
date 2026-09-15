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
  url: string
  alt: string | null
  sortOrder: number
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
  total: number
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
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
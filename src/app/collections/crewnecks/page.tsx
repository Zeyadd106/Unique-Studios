'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CollectionProductCard } from '@/components/collection/collection-product-card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { motion, AnimatePresence } from 'framer-motion'

interface CollectionProduct {
  id: string
  productId: string
  name: string
  slug: string
  description: string
  image: string | null
  images: Array<{
    id: string
    url: string
    cardUrl?: string | null
    thumbUrl?: string | null
    alt: string | null
    sortOrder: number
    isPrimary: boolean
  }>
  imageCount: number
  price: number
  salePrice: number | null
  available: boolean
  colorName?: string | null
  category: { id: string; name: string; slug: string }
  featured: boolean
  createdAt: string
  updatedAt: string
}

interface CollectionData {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
  }
  products: CollectionProduct[]
  totalProducts: number
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'most-relevant', label: 'Most relevant' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'alpha-asc', label: 'Alphabetically, A-Z' },
  { value: 'alpha-desc', label: 'Alphabetically, Z-A' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'date-asc', label: 'Date, old to new' },
  { value: 'date-desc', label: 'Date, new to old' },
]

export default function CrewnecksCollectionPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>('featured')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all')
  const [priceMin, setPriceMin] = useState<string>('')
  const [priceMax, setPriceMax] = useState<string>('')

  const fetchCollection = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/collections/crewnecks`, {
        cache: 'no-store',
      })
      const data = await response.json()
      setCollection(data)
    } catch (error) {
      console.error('Error fetching crewnecks collection:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCollection()
  }, [])

  // Compute max price from products for the price filter
  const maxPrice = useMemo(() => {
    if (!collection?.products.length) return 0
    return Math.max(...collection.products.map((p) => p.salePrice ?? p.price))
  }, [collection?.products])

  // Sort products
  const sortedProducts = useMemo(() => {
    if (!collection?.products.length) return []
    return [...collection.products].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'alpha-asc':
          return a.name.localeCompare(b.name)
        case 'alpha-desc':
          return b.name.localeCompare(a.name)
        case 'best-selling':
          return Number(b.featured) - Number(a.featured)
        case 'featured':
        default:
          return Number(b.featured) - Number(a.featured)
      }
    })
  }, [collection?.products, sortBy])

  // Filter products
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((p) => {
      if (availabilityFilter === 'in-stock' && !p.available) return false
      if (availabilityFilter === 'out-of-stock' && p.available) return false
      if (priceMin && p.price < parseFloat(priceMin)) return false
      if (priceMax && p.price > parseFloat(priceMax)) return false
      return true
    })
  }, [sortedProducts, availabilityFilter, priceMin, priceMax])

  const inStockCount = collection?.products.filter((p) => p.available).length ?? 0
  const outOfStockCount = collection?.products.filter((p) => !p.available).length ?? 0

  const handleRemoveAll = () => {
    setAvailabilityFilter('all')
    setPriceMin('')
    setPriceMax('')
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header
          locale={locale}
          setLocale={setLocale}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          t={t}
        />
        <main className="flex-1">
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="vg-skeleton h-10 w-48 rounded-full mb-4" />
                <div className="vg-skeleton h-8 w-32 rounded mb-8" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="vg-skeleton aspect-square rounded-lg mb-3" />
                      <div className="vg-skeleton h-3 w-3/4 rounded mb-2" />
                      <div className="vg-skeleton h-3 w-1/3 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <Footer locale={locale} t={t} />
        </main>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header
          locale={locale}
          setLocale={setLocale}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          t={t}
        />
        <main className="flex-1">
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="text-center py-12">
                <p className="text-[#111111]/60">Collection not found</p>
              </div>
            </div>
          </section>
          <Footer locale={locale} t={t} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      <main className="flex-1">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            {/* Collection Header */}
            <div className="mb-10 md:mb-16">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-sm font-medium text-[#111111]/60 uppercase tracking-wider">
                  Collection:
                </span>
                <h1 className="text-4xl md:text-5xl font-bold leading-none tracking-tight text-[#111111]">
                  {collection.category.name}
                </h1>
              </div>
            </div>

            {/* Filter & Sort Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 lg:mb-12">
              {/* Filters Sidebar (desktop) */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">
                    Filter:
                  </h3>

                  {/* Availability Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#111111] block mb-2">
                      Availability
                    </label>
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-2 text-xs cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={availabilityFilter === 'all'}
                          onChange={() => setAvailabilityFilter('all')}
                          className="w-3 h-3 rounded border-[#111111] text-[#111111] focus:ring-0"
                        />
                        <span className="text-[#111111]/80 group-hover:text-[#111111]">
                          All ({collection.totalProducts})
                        </span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={availabilityFilter === 'in-stock'}
                          onChange={() => setAvailabilityFilter('in-stock')}
                          className="w-3 h-3 rounded border-[#111111] text-[#111111] focus:ring-0"
                        />
                        <span className="text-[#111111]/80 group-hover:text-[#111111]">
                          In stock ({inStockCount})
                        </span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={availabilityFilter === 'out-of-stock'}
                          onChange={() => setAvailabilityFilter('out-of-stock')}
                          className="w-3 h-3 rounded border-[#111111] text-[#111111] focus:ring-0"
                        />
                        <span className="text-[#111111]/80 group-hover:text-[#111111]">
                          Out of stock ({outOfStockCount})
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#111111] block mb-2">
                      Price
                    </label>
                    <p className="text-xs text-[#111111]/60">
                      The highest price is {maxPrice.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })} EGP
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="From"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        className="w-full h-9 border border-[#111111]/30 bg-transparent px-3 text-xs text-[#111111] focus:border-[#111111] outline-none rounded-none"
                      />
                      <input
                        type="number"
                        placeholder="To"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        className="w-full h-9 border border-[#111111]/30 bg-transparent px-3 text-xs text-[#111111] focus:border-[#111111] outline-none rounded-none"
                      />
                    </div>
                    {priceMin || priceMax ? (
                      <button
                        onClick={handleRemoveAll}
                        className="text-[10px] font-medium text-[#111111] hover:text-[#111111]/70 underline underline-offset-4"
                      >
                        Remove all
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Products Header (sort + count) */}
              <div className="lg:col-span-9 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]/70">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="ml-auto flex items-baseline gap-2">
                  <label className="text-xs font-medium text-[#111111]/70 uppercase tracking-wider">
                    Sort by:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs text-[#111111] bg-transparent border-0 focus:outline-none cursor-pointer appearance-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <AnimatePresence>
              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <p className="text-[#111111]/60">
                    No products available in this collection.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 gap-y-8"
                >
                  {filteredProducts.map((product: CollectionProduct) => (
                    <CollectionProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

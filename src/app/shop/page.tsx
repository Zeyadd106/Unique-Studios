'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/product/product-card'
import { Input } from '@/components/ui/input'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import type { Product } from '@/types'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { Search, X, Sparkles, Filter, SlidersHorizontal, Flame } from 'lucide-react'

/** The three studio collections, exactly as the brand presents them. */
const SHOP_CATEGORIES = [
  { slug: '', label: 'All', hint: '' },
  { slug: 'crewnecks', label: 'Crewnecks', hint: '' },
  { slug: 'off-shoulder', label: 'Off Shoulder', hint: '' },
  { slug: 'sweatpants', label: 'Sweatpants', hint: '' },
]

const SORT_OPTIONS = [
  { value: 'featured', labelKey: 'sort.featured' },
  { value: 'newest', labelKey: 'sort.newest' },
  { value: 'priceLow', labelKey: 'sort.priceLow' },
  { value: 'priceHigh', labelKey: 'sort.priceHigh' },
  { value: 'bestSelling', labelKey: 'filters.bestSellers' },
]

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  )
}

function ShopLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-brand-mist/20 to-white">
      <div className="flex min-h-[60vh] flex-1 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <motion.div
            className="h-12 w-12 rounded-full bg-gradient-to-br from-brand to-brand/60"
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.div
            className="absolute inset-0 h-12 w-12 rounded-full bg-gradient-to-br from-brand to-brand/60 blur-xl"
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount, isInWishlist, addToWishlist } = useWishlist()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get('category') ?? '',
  )
  const [selectedSize, setSelectedSize] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('featured')

  const isNewArrivalsPage = searchParams.get('newArrivals') === 'true'

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (selectedCategory) params.append('category', selectedCategory)
        if (selectedSize) params.append('size', selectedSize)
        if (inStockOnly) params.append('inStockOnly', 'true')
        if (isNewArrivalsPage) params.append('newArrivals', 'true')
        params.append('sort', sortBy)
        const response = await fetch(`/api/products?${params.toString()}`)
        const data = await response.json()
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [search, selectedCategory, selectedSize, inStockOnly, sortBy, isNewArrivalsPage])

  const sizes = useMemo(() => ['S', 'M', 'L', 'XL', 'XXL'], [])

  const toggleWishlist = (id: string) => {
    if (!isInWishlist(id)) addToWishlist(id)
  }

  const filtered = useMemo(() => {
    const list = products.filter((product) => {
      if (selectedCategory && product.category.slug !== selectedCategory) {
        return false
      }
      if (selectedSize && !product.variants.some((variant) => variant.size === selectedSize)) {
        return false
      }
      if (inStockOnly && product.variants.every((variant) => variant.stock <= 0)) {
        return false
      }
      return true
    })

    const sorted = [...list]
    switch (sortBy) {
      case 'newest':
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
      case 'priceLow':
        sorted.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))
        break
      case 'priceHigh':
        sorted.sort(
          (a, b) =>
            (b.salePrice ?? b.price) - (a.salePrice ?? a.price),
        )
        break
      case 'bestSelling':
        sorted.sort(
          (a, b) => Number(b.bestSeller) - Number(a.bestSeller),
        )
        break
      default:
        sorted.sort((a, b) => Number(b.featured) - Number(a.featured))
    }
    return sorted
  }, [products, selectedCategory, selectedSize, inStockOnly, sortBy])

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setSelectedSize('')
    setInStockOnly(false)
    setSortBy('featured')
  }

  return (
    <div className={`flex min-h-screen flex-col ${isNewArrivalsPage ? 'bg-gradient-to-br from-brand/5 via-white to-brand/5' : 'bg-gradient-to-br from-white via-brand-mist/20 to-white'}`}>
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      <main className="flex-1 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="pointer-events-none absolute top-20 right-10 h-72 w-72 rounded-full bg-brand/5 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-20 left-10 h-96 w-96 rounded-full bg-brand/5 blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Extra animated elements for new arrivals */}
        {isNewArrivalsPage && (
          <>
            <motion.div
              className="pointer-events-none absolute top-1/4 left-1/4 h-48 w-48 rounded-full bg-orange-500/5 blur-3xl"
              animate={{
                x: [0, 20, 0],
                y: [0, -20, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="pointer-events-none absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl"
              animate={{
                x: [0, -25, 0],
                y: [0, 25, 0],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page heading */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`pt-10 pb-8 sm:pt-14 ${isNewArrivalsPage ? 'pt-16 pb-12 sm:pt-20' : ''}`}
          >
            {isNewArrivalsPage ? (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6 flex flex-wrap items-center gap-3"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-600 shadow-lg shadow-orange-200/50"
                  >
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    {t('home.newArrivals').toUpperCase()}
                  </motion.span>
                  <motion.span
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand/10 to-brand/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-brand shadow-lg shadow-brand/20"
                  >
                    <Flame className="h-4 w-4 text-brand" />
                    {locale === 'ar' ? 'الدروب الجديد وصل' : 'Just dropped'}
                  </motion.span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl"
                >
                  {t('home.newArrivals')}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 max-w-xl text-base leading-relaxed text-ink/60 sm:text-lg"
                >
                  {t('home.newArrivalsText')}
                </motion.p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-brand" />
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/50">
                    {t('nav.shop').toUpperCase()}
                  </p>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold tracking-tight text-ink sm:text-4xl"
                >
                  {t('nav.shop')}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 max-w-xl text-sm leading-relaxed text-ink/60 sm:text-base"
                >
                  {t('home.shopByCategorySubtitle')}
                </motion.p>
              </>
            )}
          </motion.header>

          {/* Search + mobile filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 space-y-4"
          >
            <div className="relative">
              <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <Search
                  className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder={t('common.searchPlaceholder')}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-12 rounded-full border-2 border-brand/20 bg-white/50 pl-12 pr-10 text-base transition-all duration-300 focus:border-brand focus:bg-white focus:shadow-lg focus:shadow-brand/20"
                  aria-label={t('common.search')}
                />
              </motion.div>
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    aria-label={t('common.clear')}
                    onClick={() => setSearch('')}
                    className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/50 transition-colors hover:bg-brand-mist hover:text-brand-deep"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-2"
              >
                {SHOP_CATEGORIES.map((category, index) => (
                  <motion.button
                    key={category.slug || 'all'}
                    type="button"
                    onClick={() => setSelectedCategory(category.slug)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                      selectedCategory === category.slug
                        ? 'border-brand bg-gradient-to-r from-brand to-brand/90 text-white shadow-lg shadow-brand/30'
                        : 'border-brand/20 bg-white/50 text-ink hover:border-brand hover:text-brand-deep hover:shadow-md'
                    }`}
                  >
                    {category.label}
                  </motion.button>
                ))}
              </motion.div>
              {isNewArrivalsPage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-brand/20 bg-white/50 px-4 py-2 text-sm font-semibold text-ink transition-all duration-300 hover:border-brand hover:bg-brand hover:text-white hover:shadow-lg hover:shadow-brand/30"
                  >
                    {t('common.viewAll')}
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>

          <div className="flex flex-col gap-10 lg:flex-row">
            {/* Filters */}
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="lg:w-64 lg:shrink-0"
            >
              <div className="lg:sticky lg:top-28">
                <div className="relative overflow-hidden rounded-2xl border-2 border-brand/10 bg-white/90 backdrop-blur-xl p-6 shadow-2xl shadow-brand/5 transition-all duration-300 hover:shadow-brand/10 hover:border-brand/20">
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="relative mb-6 flex items-center justify-between border-b border-brand/10 pb-4">
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-ink"
                    >
                      <Filter className="h-4 w-4 text-brand" />
                      {t('common.filter')}
                    </motion.h2>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.95 }}
                      type="button"
                      onClick={clearFilters}
                      className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition-all duration-300 hover:bg-brand hover:text-white"
                    >
                      {t('common.clear')}
                    </motion.button>
                  </div>

                  {/* Sizes */}
                  <motion.fieldset
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mb-6"
                  >
                    <legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/70">
                      <SlidersHorizontal className="h-3 w-3" />
                      {t('product.size')}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size, index) => (
                        <motion.button
                          key={size}
                          type="button"
                          aria-pressed={selectedSize === size}
                          onClick={() =>
                            setSelectedSize(
                              selectedSize === size ? '' : size,
                            )
                          }
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.1 + index * 0.05 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${
                            selectedSize === size
                              ? 'border-brand bg-gradient-to-r from-brand to-brand/90 text-white shadow-lg shadow-brand/30'
                              : 'border-brand/20 bg-white/50 text-ink hover:border-brand hover:text-brand-deep hover:shadow-md'
                          }`}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </div>
                  </motion.fieldset>

                  {/* Availability */}
                  <motion.fieldset
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-ink/70">
                      {t('filters.availability')}
                    </legend>
                    <motion.label
                      whileHover={{ x: 5 }}
                      className="flex cursor-pointer items-center gap-3 rounded-lg bg-brand-mist/30 p-3 text-sm text-ink transition-all duration-300 hover:bg-brand-mist/50"
                    >
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(event) => setInStockOnly(event.target.checked)}
                        className="h-4 w-4 accent-brand"
                      />
                      {t('filters.inStockOnly')}
                    </motion.label>
                  </motion.fieldset>
                </div>
              </div>
            </motion.aside>

            {/* Products */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="min-w-0 flex-1"
            >
              {/* Sort + result count */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mb-6 flex flex-wrap items-center justify-between gap-3"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="text-sm text-ink/60"
                >
                  {t('collection.inThisCollection').replace(
                    'in this collection',
                    `${filtered.length} ${filtered.length === 1 ? t('collection.piece') : t('collection.pieces')}`,
                  )}
                </motion.p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="shop-sort"
                    className="text-xs font-semibold uppercase tracking-wider text-ink/70"
                  >
                    {t('common.sort')}
                  </label>
                  <motion.select
                    id="shop-sort"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    whileFocus={{ scale: 1.02 }}
                    className="h-10 rounded-full border-2 border-brand/20 bg-white/50 px-4 text-sm font-semibold text-ink transition-all duration-300 focus:border-brand focus:bg-white focus:shadow-lg focus:shadow-brand/20"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </motion.select>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
                  >
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="aspect-[4/5] animate-pulse rounded-2xl bg-brand-mist"
                      />
                    ))}
                  </motion.div>
                ) : filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border-2 border-brand/20 bg-white/80 backdrop-blur-xl px-6 py-16 text-center shadow-xl"
                  >
                    <p className="text-ink/60">{t('common.noResults')}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`grid gap-4 sm:grid-cols-3 lg:gap-6 ${isNewArrivalsPage ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2'}`}
                  >
                    {filtered.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.05 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={`relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-brand/20 ${
                          isNewArrivalsPage ? 'ring-2 ring-brand/20 hover:ring-brand/40' : ''
                        }`}
                      >
                        {isNewArrivalsPage && product.newArrival && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.3 + index * 0.05 }}
                            className="pointer-events-none absolute top-3 left-3 z-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-orange-500/30"
                          >
                            NEW
                          </motion.div>
                        )}
                        <ProductCard
                          product={product}
                          locale={locale}
                          newLabel={t('product.new')}
                          saleLabel={t('product.sale')}
                          isInWishlist={isInWishlist}
                          onToggleWishlist={toggleWishlist}
                        />
                        {/* Hover glow effect */}
                        <motion.div
                          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand/5 via-transparent to-transparent opacity-0 transition-opacity duration-300"
                          whileHover={{ opacity: 1 }}
                        />
                        {/* Extra shine effect for new arrivals */}
                        {isNewArrivalsPage && (
                          <motion.div
                            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300"
                            whileHover={{ opacity: 1 }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

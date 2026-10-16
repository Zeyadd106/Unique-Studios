'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { Search, ShoppingBag, Heart, Sparkles, Package } from 'lucide-react'
import type { Product } from '@/types'

/** Debounced live search over the product catalog. */
export default function SearchPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount, addToCart } = useCart()
  const { wishlistCount, addToWishlist, isInWishlist } = useWishlist()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const performSearch = useCallback(async (searchTerm: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(searchTerm)}`,
      )
      const data = await response.json()
      setResults(Array.isArray(data) ? data : [])
      setSearched(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (query.trim().length >= 2) {
      const debounce = setTimeout(() => {
        void performSearch(query.trim())
      }, 300)
      return () => clearTimeout(debounce)
    }
    const timer = setTimeout(() => {
      setResults([])
      setSearched(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleAddToCart = (product: Product) => {
    const defaultVariant = product.variants[0]
    if (!defaultVariant) return

    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0]?.url ?? '',
      size: defaultVariant.size,
      color: defaultVariant.color,
      quantity: 1,
      unitPrice: product.salePrice ?? product.price,
      totalPrice: product.salePrice ?? product.price,
    })
  }

  const handleAddToWishlist = (productId: string) => {
    if (isInWishlist(productId)) return
    addToWishlist(productId)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-brand-mist/20 to-white">
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

        <section className="relative py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10 max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-3 flex items-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-4 w-4 text-brand" />
                </motion.div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/50">
                  {t('common.search').toUpperCase()}
                </p>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold leading-tight tracking-tight text-ink md:text-4xl"
              >
                {t('common.search')}
              </motion.h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative mb-10 max-w-xl"
            >
              <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <Search
                  className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40"
                  aria-hidden
                />
                <Input
                  type="search"
                  placeholder={t('common.searchPlaceholder')}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-14 border-2 border-brand/20 bg-white/50 pl-12 text-base transition-all duration-300 focus:border-brand focus:bg-white focus:shadow-lg focus:shadow-brand/20"
                  aria-label={t('common.search')}
                />
              </motion.div>
            </motion.div>

            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
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
              )}

              {!loading && searched && results.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative overflow-hidden rounded-2xl border-2 border-brand/10 bg-white/90 backdrop-blur-xl px-6 py-16 text-center shadow-2xl shadow-brand/5"
                >
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
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="mb-6 inline-flex"
                    >
                      <Search className="h-16 w-16 text-brand/40" />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-ink/60"
                    >
                      {t('common.noResults')}
                    </motion.p>
                  </div>
                </motion.div>
              )}

              {!loading && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 text-sm text-ink/60"
                  >
                    {results.length}{' '}
                    {results.length === 1 ? t('collection.piece') : t('collection.pieces')}{' '}
                    {t('common.search').toLowerCase()} "{query}"
                  </motion.p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                    {results.map((product, index) => (
                      <SearchResultCard
                        key={product.id}
                        product={product}
                        locale={locale}
                        newLabel={t('product.new')}
                        saleLabel={t('product.sale')}
                        isInWishlist={isInWishlist}
                        onToggleWishlist={handleAddToWishlist}
                        onAddToCart={handleAddToCart}
                        addToCartLabel={t('product.addToCart')}
                        index={index}
                      />
                    ))}
                  </div>
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

function SearchResultCard({
  product,
  locale,
  newLabel,
  saleLabel,
  isInWishlist,
  onToggleWishlist,
  onAddToCart,
  addToCartLabel,
  index,
}: {
  product: Product
  locale: string
  newLabel: string
  saleLabel: string
  isInWishlist: (id: string) => boolean
  onToggleWishlist: (productId: string) => void
  onAddToCart: (product: Product) => void
  addToCartLabel: string
  index: number
}) {
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0]
  const secondaryImage =
    product.images.length > 1 ? product.images[1] : null
  const wished = isInWishlist(product.id)
  const displayPrice = product.salePrice ?? product.price
  const isOnSale = Boolean(product.salePrice)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-brand/20"
    >
      {/* Hover glow effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand/5 via-transparent to-transparent opacity-0 transition-opacity duration-300"
        whileHover={{ opacity: 1 }}
      />
      <div>
        <Link
          href={`/product/${product.slug}`}
          aria-label={product.name}
          className="block"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-mist">
            {primaryImage && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="relative h-full w-full"
              >
                <Image
                  fill
                  src={primaryImage.cardUrl ?? primaryImage.url}
                  alt={primaryImage.alt ?? product.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw"
                  priority={false}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </motion.div>
            )}
            {secondaryImage && (
              <Image
                fill
                src={secondaryImage.cardUrl ?? secondaryImage.url}
                alt={secondaryImage.alt ?? `${product.name} — alternate view`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw"
                priority={false}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
            <div className="absolute start-3 top-3 flex flex-col gap-2">
              {product.newArrival && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className="pointer-events-none rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-lg shadow-orange-500/30"
                >
                  {newLabel}
                </motion.span>
              )}
              {isOnSale && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.15 }}
                  className="pointer-events-none rounded-full border-2 border-brand bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide text-brand shadow-lg"
                >
                  {saleLabel}
                </motion.span>
              )}
            </div>
            {onToggleWishlist && (
              <motion.button
                type="button"
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={wished}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 + 0.2 }}
                onClick={(event) => {
                  event.preventDefault()
                  onToggleWishlist(product.id)
                }}
                className="absolute end-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-brand opacity-0 shadow-md backdrop-blur transition-all duration-300 hover:bg-white hover:scale-110 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Heart
                  className={`h-5 w-5 ${wished ? 'fill-brand text-brand' : 'text-ink/70'}`}
                />
              </motion.button>
            )}
          </div>

          <div className="pt-3 px-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.25 }}
            >
              <h3 className="line-clamp-1 text-sm font-bold leading-snug text-ink transition-colors group-hover:text-brand">
                {product.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs uppercase tracking-wider text-ink/50">
                <Package className="h-3 w-3" />
                {product.category.name}
              </p>
              <p className="mt-1 text-sm font-bold text-ink">
                {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                  style: 'currency',
                  currency: 'EGP',
                  maximumFractionDigits: 0,
                }).format(displayPrice)}
                {isOnSale && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 + 0.3 }}
                    className="ml-2 text-xs font-normal text-ink/50 line-through"
                  >
                    {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                      style: 'currency',
                      currency: 'EGP',
                      maximumFractionDigits: 0,
                    }).format(product.price)}
                  </motion.span>
                )}
              </p>
            </motion.div>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + 0.35 }}
          className="px-2 pb-2"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="sm"
              className="relative w-full overflow-hidden bg-gradient-to-r from-brand to-brand/90 text-white shadow-lg shadow-brand/20 transition-all duration-300 hover:shadow-brand/40"
              onClick={() => onAddToCart(product)}
            >
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                {addToCartLabel}
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.article>
  )
}

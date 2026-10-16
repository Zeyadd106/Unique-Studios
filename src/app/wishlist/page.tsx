'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Package } from 'lucide-react'
import type { Product } from '@/types'

export default function WishlistPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const {
    wishlist,
    removeFromWishlist,
    clearWishlist,
    mounted,
  } = useWishlist()
  const { cartCount, addToCart } = useCart()

  if (!mounted) {
    return null
  }

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId)
  }

  const handleMoveToCart = (productId: string) => {
    // The wishlist stores product IDs — look the product up by id.
    void fetchProductById(productId).then((product) => {
      if (!product) return
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
      removeFromWishlist(product.id)
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-brand-mist/20 to-white">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
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
              className="mb-10 flex flex-wrap items-end justify-between gap-4"
            >
              <div className="max-w-2xl">
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
                    <Heart className="h-4 w-4 text-brand fill-brand" />
                  </motion.div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/50">
                    {t('nav.wishlist').toUpperCase()}
                  </p>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold leading-tight tracking-tight text-ink md:text-4xl"
                >
                  {t('nav.wishlist')}
                </motion.h1>
              </div>
              <AnimatePresence>
                {wishlist.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Button
                      variant="outline"
                      onClick={clearWishlist}
                      className="border-2 border-red-200 bg-white text-red-600 transition-all duration-300 hover:border-red-600 hover:bg-red-50 hover:text-red-600 hover:shadow-lg hover:shadow-red-200/50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence mode="wait">
              {wishlist.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative overflow-hidden rounded-2xl border-2 border-brand/10 bg-white/90 backdrop-blur-xl px-6 py-20 text-center shadow-2xl shadow-brand/5"
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
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Heart className="h-20 w-20 text-brand/40" />
                      </motion.div>
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-bold text-ink"
                    >
                      {t('nav.wishlist')}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mx-auto mt-3 max-w-md text-sm text-ink/60"
                    >
                      Save items you love by clicking the heart icon on any product.
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link href="/shop" className="mt-8 inline-flex">
                        <Button
                          size="lg"
                          className="relative overflow-hidden bg-gradient-to-r from-brand to-brand/90 text-white shadow-xl shadow-brand/30 transition-all duration-300 hover:shadow-brand/50 hover:scale-105"
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
                          <span className="relative flex items-center gap-2">
                            {t('cart.continueShopping')}
                            <ArrowRight className="ms-2 h-5 w-5" />
                          </span>
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {wishlist.map((productId, index) => (
                    <WishlistItem
                      key={productId}
                      productId={productId}
                      onRemove={handleRemoveFromWishlist}
                      onMoveToCart={handleMoveToCart}
                      locale={locale}
                      t={t}
                      index={index}
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

async function fetchProductById(productId: string): Promise<Product | null> {
  try {
    const response = await fetch('/api/products')
    const data = await response.json()
    const products: Product[] = Array.isArray(data) ? data : []
    return products.find((product) => product.id === productId) ?? null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

interface WishlistItemProps {
  productId: string
  onRemove: (productId: string) => void
  onMoveToCart: (productId: string) => void
  locale: string
  t: (key: string) => string
  index: number
}

function WishlistItem({
  productId,
  onRemove,
  onMoveToCart,
  locale,
  t,
  index,
}: WishlistItemProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchProductById(productId).then((found) => {
      setProduct(found)
      setLoading(false)
    })
  }, [productId])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className="animate-pulse rounded-2xl border-2 border-brand/10 bg-white/50 p-4 shadow-lg"
      >
        <div className="aspect-square w-full rounded-xl bg-brand-mist" />
        <div className="mt-4 h-4 w-2/3 rounded bg-brand-mist" />
        <div className="h-4 w-1/3 rounded bg-brand-mist" />
      </motion.div>
    )
  }

  if (!product) {
    return null
  }

  const displayPrice = product.salePrice ?? product.price
  const isOnSale = Boolean(product.salePrice)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl border-2 border-brand/10 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-brand/20"
    >
      {/* Hover glow effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand/5 via-transparent to-transparent opacity-0 transition-opacity duration-300"
        whileHover={{ opacity: 1 }}
      />
      <Link href={`/product/${product.slug}`} className="block" aria-label={product.name}>
        <div className="relative aspect-square overflow-hidden bg-brand-mist">
          {product.images[0] ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="relative h-full w-full"
            >
              <Image
                fill
                src={product.images[0].cardUrl ?? product.images[0].url}
                alt={product.images[0].alt ?? product.name}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw"
                priority={false}
                loading="lazy"
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-ink/40">
              No image
            </div>
          )}
          {product.newArrival && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="pointer-events-none absolute top-3 left-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-orange-500/30"
            >
              NEW
            </motion.div>
          )}
        </div>
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.1 }}
          >
            <h3 className="line-clamp-1 font-bold text-ink transition-colors group-hover:text-brand">
              {product.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs uppercase tracking-wider text-ink/50">
              <Package className="h-3 w-3" />
              {product.category.name}
            </p>
            <p className="mt-2 text-sm font-bold text-ink">
              {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                style: 'currency',
                currency: 'EGP',
                maximumFractionDigits: 0,
              }).format(displayPrice)}
              {isOnSale && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
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
        transition={{ delay: index * 0.1 + 0.15 }}
        className="flex items-center justify-between gap-2 border-t-2 border-brand/10 p-4"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMoveToCart(product.id)}
            className="border-2 border-brand/20 bg-white/50 text-ink transition-all duration-300 hover:border-brand hover:bg-brand hover:text-white hover:shadow-lg hover:shadow-brand/30"
          >
            <ShoppingBag className="h-4 w-4" />
            {t('product.addToCart')}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            variant="ghost"
            aria-label={t('cart.removeItem')}
            onClick={() => onRemove(productId)}
            className="text-ink/60 transition-all duration-300 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </motion.div>
      </motion.div>
    </motion.article>
  )
}

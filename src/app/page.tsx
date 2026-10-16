'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { motion } from 'framer-motion'
import type { Product, Category } from '@/types'

function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 gap-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="vg-skeleton aspect-[2/3] rounded-lg" />
          <div className="vg-skeleton mt-3 h-3 w-3/4 rounded" />
          <div className="vg-skeleton mt-2 h-3 w-1/3 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount, addToWishlist, isInWishlist } = useWishlist()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ])
        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()
        if (Array.isArray(productsData)) setProducts(productsData)
        if (Array.isArray(categoriesData)) setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading home data:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeProducts = products.filter((p) => p.active)
  const newArrivals = activeProducts.filter((p) => p.newArrival)
  const bestSellers = activeProducts.filter((p) => p.bestSeller)
  const featured = activeProducts.filter((p) => p.featured)

  const cardProps = {
    locale,
    newLabel: t('product.new'),
    saleLabel: t('product.sale'),
    isInWishlist,
    onToggleWishlist: (id: string) => {
      if (!isInWishlist(id)) addToWishlist(id)
    },
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      <main className="flex-1">
        {/* Premium Hero */}
        <section className="relative h-[82svh] min-h-[640px] w-full overflow-hidden bg-[#F3F3F3]">
          <Image
            src="/images/optimized/IMG_5531-gallery.webp"
            alt="UNIQUE STUDIOS fashion hero"
            fill
            sizes="100vw"
            priority
            className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="w-full max-w-2xl text-center"
            >
              <span className="inline-block mb-4 px-3 py-1 rounded-full bg-white/90 text-[#111111] text-[11px] font-bold uppercase tracking-widest">
                New Collection
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6 tracking-tight">
                Built Different.<br />
                <span className="italic">Worn Unique.</span>
              </h1>
              <p className="text-sm md:text-base text-white/80 max-w-md mx-auto mb-10 leading-relaxed">
                Premium oversized streetwear for those who dare to stand out.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/shop">
                  <Button size="lg" className="bg-white text-[#111111] px-10 py-3.5 rounded-full font-bold tracking-wider hover:bg-white/90">
                    {t('hero.cta')}
                  </Button>
                </Link>
                <Link
                  href="/about"
                  className="text-white/80 hover:text-white transition-opacity underline underline-offset-4"
                >
                  {t('hero.secondaryCta')}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Shop By Category */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">{t('home.shopByCategory')}</h2>
              <p className="mt-2 text-sm text-[#111111]/60">
                Explore our core collections.
              </p>
            </div>
            <Link href="/categories" className="text-sm font-semibold hover:opacity-70 transition-opacity">
              {t('common.viewAll')} <span aria-hidden="true">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group relative rounded-xl bg-[#F3F3F3] overflow-hidden aspect-[4/5]">
                  <div className="vg-skeleton h-full w-full" />
                  <div className="absolute bottom-4 left-4 vg-skeleton h-3 w-1/4 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {categories.map((category) => {
                const cover = category.image
                return (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className="group block"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-[#F3F3F3]">
                      {cover ? (
                        <Image
                          fill
                          src={cover}
                          alt={category.name}
                          sizes="(max-width: 768px) 50vw, 25vw"
                          priority={false}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#111111]/20 text-2xl font-bold">
                          {category.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                      <div className="absolute bottom-0 start-0 end-0 p-6">
                        <h3 className="text-xl md:text-2xl font-bold text-white">{category.name}</h3>
                        <p className="text-sm text-white/90 mt-1">
                          {category.description}
                        </p>
                      </div>
                      <button
                        aria-label={`Shop ${category.name} collection`}
                        className="absolute top-4 end-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#111111] hover:bg-white transition-all shadow-sm"
                      >
                        <span className="sr-only">Shop {category.name}</span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8 md:mb-12">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                    {t('home.newArrivals')}
                  </h2>
                  <p className="mt-2 text-sm text-[#111111]/60">
                    Just landed — the latest pieces from the studio.
                  </p>
                </div>
                <Link href="/shop" className="text-sm font-semibold hover:opacity-70 transition-opacity">
                  {t('common.viewAll')} <span aria-hidden="true">→</span>
                </Link>
              </div>
              {loading ? (
                <SkeletonGrid count={8} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 gap-y-8">
                  {newArrivals.slice(0, 10).map((product) => (
                    <ProductCard key={product.id} product={product} {...cardProps} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <section className="bg-[#F5F5F5] border-y border-[#E5E5E5] py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8 md:mb-12">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                    {t('home.bestSellers')}
                  </h2>
                  <p className="mt-2 text-sm text-[#111111]/60">
                    Customer favourites, restocked season after season.
                  </p>
                </div>
                <Link href="/shop" className="text-sm font-semibold hover:opacity-70 transition-opacity">
                  {t('common.viewAll')} <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 gap-y-8">
                {bestSellers.slice(0, 10).map((product) => (
                  <ProductCard key={product.id} product={product} {...cardProps} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA band */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                {t('hero.title')}
              </h2>
              <p className="text-sm md:text-base text-[#111111]/70 max-w-2xl mx-auto mb-8 leading-relaxed">
                {t('home.joinMovement')}
              </p>
              <Link href="/shop">
                <Button size="lg" className="bg-[#111111] text-white px-10 py-3.5 rounded-full font-bold tracking-wider hover:bg-[#2b2b2b]">
                  {t('hero.cta')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

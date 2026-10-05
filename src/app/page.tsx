'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Pause, Play } from 'lucide-react'
import type { Product, Category } from '@/types'

function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 gap-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="vg-skeleton aspect-[3/4] rounded-md" />
          <div className="vg-skeleton mt-3 h-3 w-3/4 rounded" />
          <div className="vg-skeleton mt-2 h-3 w-1/3 rounded" />
        </div>
      ))}
    </div>
  )
}

// Fullscreen video hero (MZACO-style): autoplay muted loop, poster fallback,
// play/pause toggle, outlined NEW ARRIVALS CTA. Drop your clip at
// public/hero.mp4 and it plays automatically — no code change needed.
function HeroVideo({
  newArrivalsLabel,
  learnMoreLabel,
}: {
  newArrivalsLabel: string
  learnMoreLabel: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)
  const [hasVideo, setHasVideo] = useState(true)
  const [hasPoster, setHasPoster] = useState(true)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <section className="relative h-[92svh] min-h-[540px] w-full overflow-hidden bg-black text-white">
      {/* Poster fallback (also shows until the video can play) */}
      {hasPoster && (
        <Image
          src="/hero-poster.jpg"
          alt=""
          fill
          priority
          onError={() => setHasPoster(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Hero clip — replace public/hero.mp4 with your own shoot */}
      {hasVideo && (
        <video
          ref={videoRef}
          src="/hero.mp4"
          poster="/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setHasVideo(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Legibility gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/60" />

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause video' : 'Play video'}
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition hover:bg-black/60"
          >
            {playing ? <Pause className="h-7 w-7" /> : <Play className="ms-1 h-7 w-7" />}
          </button>
          <h1 className="sr-only">Unique Studios</h1>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center">
            <Link href="/shop">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white bg-transparent px-10 tracking-[0.2em] text-white hover:bg-white hover:text-black w-full sm:w-auto"
              >
                {newArrivalsLabel}
              </Button>
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold text-white/80 underline underline-offset-8 hover:text-white"
            >
              {learnMoreLabel}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
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

  const newArrivals = products.filter((p) => p.newArrival).concat(
    products.filter((p) => !p.newArrival)
  )
  const bestSellers = products.filter((p) => p.bestSeller)

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
        <HeroVideo
          newArrivalsLabel={t('hero.newArrivals')}
          learnMoreLabel={t('hero.secondaryCta')}
        />

        {/* Category circles */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <h2 className="text-lg md:text-xl font-bold mb-5 text-center">
            {t('home.shopByCategory')}
          </h2>
          {loading ? (
            <div className="flex gap-5 justify-start md:justify-center overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="vg-skeleton w-20 h-20 md:w-28 md:h-28 rounded-full" />
                  <div className="vg-skeleton h-3 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-5 md:gap-8 justify-start md:justify-center overflow-x-auto pb-2">
              {categories.map((category) => {
                const cover = products.find((p) => p.categoryId === category.id)?.images[0]
                return (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className="flex flex-col items-center gap-2 shrink-0 group"
                  >
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#F3F3F3] overflow-hidden transition-transform group-hover:scale-105">
                      {cover ? (
                        <img
                          src={cover.url}
                          alt={category.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[11px] md:text-xs font-bold text-center px-2 leading-tight">
                          {category.name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs md:text-sm font-semibold">{category.name}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* New arrivals */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-lg md:text-xl font-bold">{t('home.newArrivals')}</h2>
            <Link href="/shop" className="text-xs md:text-sm font-semibold hover:opacity-70">
              {t('common.viewAll')}
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 gap-y-6">
              {newArrivals.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} {...cardProps} />
              ))}
            </div>
          )}
        </section>

        {/* Brand strip */}
        <section className="mt-8 md:mt-12 bg-[#F5F5F5] border-y border-[#E5E5E5]">
          <div className="max-w-3xl mx-auto px-4 py-10 md:py-14 text-center">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#111111]">{t('home.ourStory')}</h2>
            <p className="mt-3 text-sm md:text-base text-[#111111]/70 leading-relaxed">
              {t('home.ourStoryText')}
            </p>
          </div>
        </section>

        {/* Best sellers */}
        {bestSellers.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <div className="flex items-end justify-between mb-5">
              <h2 className="text-lg md:text-xl font-bold">{t('home.bestSellers')}</h2>
              <Link href="/shop" className="text-xs md:text-sm font-semibold hover:opacity-70">
                {t('common.viewAll')}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 md:gap-x-5 gap-y-6">
              {bestSellers.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} {...cardProps} />
              ))}
            </div>
          </section>
        )}

        {/* CTA band */}
        <section className="bg-gradient-to-b from-[#111111] to-[#000000] text-white mt-4">
          <div className="max-w-7xl mx-auto px-4 py-10 md:py-14 text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              {t('hero.title')}
            </h2>
            <p className="mt-3 text-sm md:text-base text-white/70 max-w-2xl mx-auto">
              {t('home.joinMovement')}
            </p>
            <Link href="/shop">
              <Button size="lg" className="mt-6 bg-white text-[#111111] hover:bg-white/85">
                {t('hero.cta')}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

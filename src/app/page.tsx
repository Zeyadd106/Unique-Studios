'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Flame,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/product/product-card'
import { CollectionProductCard } from '@/components/collection/collection-product-card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import type { Product } from '@/types'

/* ---------------------------------------------------------------------------
 * Homepage — cinematic flagship experience:
 * parallax hero → marquee → new drop → chapters → arrivals → craft →
 * featured editorials → reviews → story → final CTA.
 * ------------------------------------------------------------------------- */

interface CategoryChapter {
  slug: string
  name: string
  fallbackImage: string
  tagline: string
}

const CATEGORY_CHAPTERS: CategoryChapter[] = [
  {
    slug: '/collections/crewnecks',
    name: 'CREWNECKS',
    fallbackImage: '/images/optimized/IMG_5546-card.webp',
    tagline: 'Heavyweight icons',
  },
  {
    slug: '/collections/off-shoulder',
    name: 'OFF-SHOULDER',
    fallbackImage: '/images/optimized/IMG_5531-card.webp',
    tagline: 'Soft statement fits',
  },
  {
    slug: '/collections/sweatpants',
    name: 'SWEATPANTS',
    fallbackImage: '/images/optimized/IMG_5544-card.webp',
    tagline: 'Everyday uniforms',
  },
]

interface CollectionProductCardData {
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
}

function toChapterCard(product: Product): CollectionProductCardData {
  const images = product.images.map((image) => ({
    id: image.id,
    url: image.url,
    cardUrl: image.cardUrl ?? image.url,
    thumbUrl: image.thumbUrl ?? image.url,
    alt: image.alt,
    sortOrder: image.sortOrder,
    isPrimary: image.isPrimary ?? false,
  }))
  return {
    id: product.id,
    productId: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    image: images[0]?.cardUrl ?? null,
    images,
    imageCount: images.length,
    price: product.price,
    salePrice: product.salePrice,
    available: product.active,
    colorName: null,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    featured: product.featured,
  }
}

/* Scroll-triggered fade-up wrapper */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* Animated counter that runs once when scrolled into view */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const duration = 1400
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(eased * to))
          if (progress < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to])

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  )
}

const headlineContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const headlineWord: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: -45 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] },
  },
}

const gridContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const gridItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] },
  },
}

const MARQUEE_WORDS = [
  'OVERSIZED FIT',
  'PREMIUM COTTON',
  'CASH ON DELIVERY',
  'NEW DROP LIVE',
  'BUILT DIFFERENT',
  'WORN UNIQUE',
]

export default function HomePage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount, isInWishlist, addToWishlist } = useWishlist()
  const reduceMotion = useReducedMotion()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const { scrollY, scrollYProgress } = useScroll()
  const heroY = useTransform(scrollY, [0, 700], [0, reduceMotion ? 0 : 130])
  const heroFade = useTransform(scrollY, [0, 550], [1, reduceMotion ? 1 : 0.25])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        if (!cancelled) setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error loading home data:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const activeProducts = useMemo(
    () => products.filter((product) => product.active),
    [products]
  )

  const newArrivals = useMemo(() => {
    const flagged = activeProducts.filter((product) => product.newArrival)
    if (flagged.length > 0) return flagged
    return [...activeProducts]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 8)
  }, [activeProducts])

  const chapterCards = useMemo(() => {
    const map = new Map<string, CollectionProductCardData[]>()
    for (const chapter of CATEGORY_CHAPTERS) {
      map.set(chapter.slug, [])
    }
    for (const product of activeProducts) {
      const chapter = CATEGORY_CHAPTERS.find(
        (candidate) =>
          `/collections/${product.category.slug}` === candidate.slug ||
          (candidate.slug === '/collections/crewnecks' &&
            product.category.slug === 'round-neck')
      )
      if (!chapter) continue
      map.get(chapter.slug)!.push(toChapterCard(product))
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }
    return map
  }, [activeProducts])

  const toggleWishlist = (id: string) => {
    if (!isInWishlist(id)) addToWishlist(id)
  }

  const cardProps = {
    locale,
    newLabel: t('product.new'),
    saleLabel: t('product.sale'),
    isInWishlist,
    onToggleWishlist: toggleWishlist,
  }

  const headlineWords = t('hero.title').split(' ')
  const isAr = locale === 'ar'

  const reviews =
    isAr
      ? [
          { name: 'مريم', text: 'الخامة ناعمة والشكل أحلى من الصور. المقاس مظبوط بالظبط.', stars: 5 },
          { name: 'كريم', text: 'أريح سويت بانتس لبستها. الخامة تقيلة والفنش نضيف.', stars: 5 },
          { name: 'عمر', text: 'تجربة شراء سهلة والدفع عند الاستلام. هوصل لكل صحابي.', stars: 5 },
        ]
      : [
          { name: 'Mariam S.', text: 'Perfect oversized fit — soft fabric, clean stitching, true to the size chart.', stars: 5 },
          { name: 'Karim A.', text: 'Most comfortable sweatpants I own. Premium heavyweight feel.', stars: 5 },
          { name: 'Omar K.', text: 'Ordered in minutes, paid cash on delivery. This brand gets it.', stars: 5 },
        ]

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      {/* Scroll progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: scrollYProgress }}
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brand via-amber-400 to-brand"
      />

      <main className="flex-1">
        {/* ------------------------------------------------ HERO */}
        <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-black">
          <motion.div style={{ y: heroY }} className="absolute inset-0">
            <div className="us-kenburns absolute inset-0">
              <Image
                src="/images/optimized/IMG_5531-gallery.webp"
                alt="UNIQUE STUDIOS — oversized streetwear"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          <div className="us-glow absolute -top-24 end-0 h-96 w-96 rounded-full opacity-60" />

          {/* Ghost numerals */}
          <div
            aria-hidden
            className="us-text-stroke pointer-events-none absolute top-16 start-4 select-none text-[22vw] font-bold leading-none tracking-tighter opacity-40 sm:start-8 lg:text-[15rem]"
          >
            US
          </div>

          <motion.div
            style={{ opacity: heroFade }}
            className="relative mx-auto w-full max-w-7xl px-5 pb-28 pt-36 sm:px-8 lg:pb-36"
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-6 flex flex-wrap items-center gap-3"
            >
              <span className="us-glass us-float inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                {t('home.newArrivals').toUpperCase()}
              </span>
              <span className="us-glass us-float us-float-delay inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                <Flame className="h-3.5 w-3.5 text-orange-400" aria-hidden />
                {isAr ? 'الدروب الجديد وصل' : 'The new drop just landed'}
              </span>
            </motion.div>

            <motion.h1
              variants={headlineContainer}
              initial="hidden"
              animate="show"
              className="max-w-4xl text-[13vw] font-bold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl"
              style={{ perspective: 800 }}
            >
              {headlineWords.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  variants={headlineWord}
                  className={`mr-[0.25em] inline-block ${
                    i === headlineWords.length - 1 ? 'us-gradient-text' : ''
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: 'easeOut' }}
              className="mt-6 max-w-md text-sm leading-relaxed text-white/85 sm:text-lg"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <Link
                href="/shop"
                className="us-cta us-shine group inline-flex items-center justify-center gap-2 rounded-full bg-white px-9 py-4 text-sm font-bold text-black"
              >
                {t('hero.cta')}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  aria-hidden
                />
              </Link>
              <Link
                href="/collections/crewnecks"
                className="us-cta inline-flex items-center justify-center gap-1.5 rounded-full border border-white/40 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white/10"
              >
                {t('hero.secondaryCta')}
                <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
            </motion.div>

            {/* Live stats */}
            <motion.dl
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: 'easeOut' }}
              className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/20 pt-7 text-white"
            >
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {isAr ? 'قطعة' : 'Pieces'}
                </dt>
                <dd className="mt-1 text-2xl font-bold sm:text-3xl">
                  <CountUp to={Math.max(activeProducts.length, 4)} suffix="+" />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {isAr ? 'التقييم' : 'Rating'}
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-2xl font-bold sm:text-3xl">
                  4.9
                  <Star className="h-5 w-5 fill-amber-300 text-amber-300" aria-hidden />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {isAr ? 'الدفع' : 'Payment'}
                </dt>
                <dd className="mt-1 text-2xl font-bold sm:text-3xl">COD</dd>
              </div>
            </motion.dl>
          </motion.div>

          {/* Scroll cue */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70">
            <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/40 p-1.5">
              <div className="us-scroll-dot h-2 w-2 rounded-full bg-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
              {isAr ? 'اسحب' : 'Scroll'}
            </span>
          </div>
        </section>

        {/* ------------------------------------------------ MARQUEE */}
        <div className="overflow-hidden border-y border-black bg-black py-4" aria-hidden>
          <div className="us-marquee-track items-center gap-8 text-sm font-bold tracking-[0.25em] text-white">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((word, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className={i % 2 === 1 ? 'text-amber-300' : ''}>{word}</span>
                <Sparkles className="h-4 w-4 text-white/40" aria-hidden />
              </span>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------ NEW DROP */}
        <section className="relative isolate overflow-hidden bg-black text-white">
          <div className="absolute inset-0">
            <motion.div
              initial={{ scale: 1.12 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="relative h-full w-full"
            >
              <Image
                src="/images/optimized/IMG_5544-gallery.webp"
                alt="UNIQUE STUDIOS — new season preview"
                fill
                sizes="100vw"
                priority={false}
                className="object-cover opacity-70"
              />
            </motion.div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent" />
          <div className="relative mx-auto flex max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
            <Reveal className="max-w-2xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-black">
                <Flame className="h-3.5 w-3.5" aria-hidden />
                {isAr ? 'دروب جديد' : 'Just dropped'}
              </p>
              <h2 className="text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
                {t('home.newDrop')}
                <span className="us-gradient-text block">{t('home.newArrivals')}</span>
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                {t('home.newDropText')}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/shop?newArrivals=true"
                  className="us-cta us-shine group inline-flex items-center justify-center gap-2 rounded-full bg-white px-9 py-4 text-sm font-bold text-black"
                >
                  {t('common.shopNow')}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    aria-hidden
                  />
                </Link>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/70">
                  <BadgeCheck className="h-4 w-4 text-amber-300" aria-hidden />
                  {isAr ? 'الدفع عند الاستلام' : 'Cash on delivery · 14-day exchange'}
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------ CHAPTERS */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div
            aria-hidden
            className="us-text-stroke-dark pointer-events-none absolute -top-4 start-0 select-none text-[20vw] font-bold leading-none tracking-tighter opacity-60 lg:text-[12rem]"
          >
            01
          </div>
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-ink/50">
                  <span className="h-px w-8 bg-brand" aria-hidden />
                  {t('home.featuredCollections')}
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">
                  {t('home.shopByCategory')}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/60 sm:text-base">
                  {t('home.shopByCategorySubtitle')}
                </p>
              </div>
              <Link
                href="/categories"
                className="group inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline hover:underline-offset-4"
              >
                {t('common.viewAll')}
                <ChevronRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  aria-hidden
                />
              </Link>
            </Reveal>

            <motion.div
              variants={gridContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
            >
              {CATEGORY_CHAPTERS.map((chapter, index) => (
                <motion.div key={chapter.slug} variants={gridItem}>
                  <Link
                    href={chapter.slug}
                    aria-label={chapter.name}
                    className="us-tilt us-shine group block rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-brand-mist shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] transition-shadow duration-500 group-hover:shadow-[0_36px_80px_-28px_rgba(0,0,0,0.55)]">
                      <Image
                        fill
                        src={chapter.fallbackImage}
                        alt={chapter.name}
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        priority={false}
                        loading="lazy"
                        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110 group-hover:rotate-[0.5deg]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      <span className="absolute end-5 top-5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-white backdrop-blur-md">
                        0{index + 1}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 translate-y-0 p-6 transition-transform duration-500 sm:p-8">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">
                          {chapter.tagline}
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                          {chapter.name}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black opacity-0 transition-all duration-500 group-hover:opacity-100">
                          {t('common.viewCollection')}
                          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <div className="us-rule mx-auto max-w-7xl" aria-hidden />

        {/* ------------------------------------------------ NEW ARRIVALS */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-mist/50 via-white to-brand-mist/30 py-20 sm:py-28">
          {/* Animated background elements */}
          <motion.div
            className="pointer-events-none absolute top-10 left-10 h-64 w-64 rounded-full bg-brand/5 blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-10 right-10 h-96 w-96 rounded-full bg-brand/5 blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute end-0 top-8 select-none text-[18vw] font-bold leading-none tracking-tighter text-black/[0.04] lg:text-[10rem]"
          >
            NEW
          </div>
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-600 shadow-lg shadow-orange-200/50"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Flame className="h-4 w-4 text-orange-500" aria-hidden />
                  </motion.div>
                  {isAr ? 'وصل حديثاً' : 'Fresh off the rack'}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-3xl font-bold tracking-tight text-ink sm:text-5xl"
                >
                  {t('home.newArrivals')}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mt-3 max-w-xl text-sm leading-relaxed text-ink/60 sm:text-base"
                >
                  {t('home.newArrivalsText')}
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Link
                  href="/shop?newArrivals=true"
                  className="us-cta group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-black to-gray-800 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/20 transition-all duration-300 hover:shadow-black/40 hover:scale-105"
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
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
                    {t('common.viewAll')}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      aria-hidden
                    />
                  </span>
                </Link>
              </motion.div>
            </Reveal>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="vg-skeleton aspect-[4/5] rounded-2xl"
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={gridContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
              >
                {newArrivals.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={gridItem}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-brand/20">
                      <ProductCard product={product} {...cardProps} />
                      {/* Hover glow effect */}
                      <motion.div
                        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand/5 via-transparent to-transparent opacity-0 transition-opacity duration-300"
                        whileHover={{ opacity: 1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------ CRAFT */}
        <section className="border-y border-brand-line bg-white py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-3 sm:px-8">
            {[
              {
                icon: Truck,
                title: isAr ? 'توصيل سريع' : 'Fast delivery',
                text: isAr ? 'من ٢ لـ ٥ أيام عمل لأي مكان في مصر.' : '2–5 business days anywhere in Egypt.',
              },
              {
                icon: ShieldCheck,
                title: isAr ? 'دفع آمن' : 'Cash on delivery',
                text: isAr ? 'ادفع كاش لما تستلم طلبك.' : 'Pay in cash when your order arrives.',
              },
              {
                icon: RefreshCcw,
                title: isAr ? 'استبدال سهل' : '14-day exchange',
                text: isAr ? 'استبدال المقاس خلال ١٤ يوم.' : 'Hassle-free size exchange within 14 days.',
              },
            ].map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.1} className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                  <feature.icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{feature.title}</span>
                  <span className="mt-1 block text-sm text-ink/60">{feature.text}</span>
                </span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ FEATURED CHAPTERS */}
        {CATEGORY_CHAPTERS.map((chapter, index) => {
          const chapterProducts = chapterCards.get(chapter.slug) ?? []
          if (chapterProducts.length === 0) return null
          const flip = index % 2 === 1
          return (
            <section
              key={chapter.slug}
              className={flip ? 'bg-black text-white' : 'bg-white'}
            >
              <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.4fr] lg:gap-14 lg:py-28">
                <Reveal className={flip ? 'lg:order-2' : ''}>
                  <p
                    className={`mb-3 text-xs font-bold uppercase tracking-[0.25em] ${
                      flip ? 'text-white/50' : 'text-ink/50'
                    }`}
                  >
                    {t('home.featuredCollections').toUpperCase()} — 0{index + 1}
                  </p>
                  <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    {chapter.name}
                    <span className={`block text-lg font-semibold ${flip ? 'text-amber-300' : 'text-ink/50'}`}>
                      {chapter.tagline} · {chapterProducts.length}{' '}
                      {chapterProducts.length === 1
                        ? t('collection.piece')
                        : t('collection.pieces')}
                    </span>
                  </h2>
                  <Link
                    href={chapter.slug}
                    className={`us-cta group mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold ${
                      flip ? 'bg-white text-black' : 'bg-black text-white'
                    }`}
                  >
                    {t('common.viewAll')}
                    <ChevronRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </Reveal>
                <motion.div
                  variants={gridContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
                  className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5 ${flip ? 'lg:order-1' : ''}`}
                >
                  {chapterProducts.slice(0, 3).map((product) => (
                    <motion.div key={product.id} variants={gridItem}>
                      <CollectionProductCard product={product} locale={locale} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>
          )
        })}

        {/* ------------------------------------------------ REVIEWS */}
        <section className="relative overflow-hidden bg-brand-mist/50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal className="mb-12 text-center">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" aria-hidden />
                4.9 — {isAr ? 'تقييم عملائنا' : 'Loved by our community'}
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">
                {isAr ? 'قالوا عنا' : 'Worn. Rated. Repeated.'}
              </h2>
            </Reveal>
            <motion.div
              variants={gridContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid gap-5 md:grid-cols-3"
            >
              {reviews.map((review) => (
                <motion.figure
                  key={review.name}
                  variants={gridItem}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className="rounded-3xl border border-brand-line bg-white p-7 shadow-[0_24px_60px_-34px_rgba(0,0,0,0.35)]"
                >
                  <div className="flex gap-1" aria-label={`${review.stars} stars`}>
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-ink/80">
                    “{review.text}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                      {review.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink">{review.name}</span>
                      <span className="flex items-center gap-1 text-xs text-ink/50">
                        <BadgeCheck className="h-3.5 w-3.5 text-green-600" aria-hidden />
                        {isAr ? 'مشتري موثّق' : 'Verified buyer'}
                      </span>
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ------------------------------------------------ STORY */}
        <section className="overflow-hidden bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-28">
            <Reveal>
              <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-ink/50">
                <span className="h-px w-8 bg-brand" aria-hidden />
                {t('home.ourStory')}
              </p>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                {t('home.ourStory')}
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">
                {t('home.ourStoryText')}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/about"
                  className="us-cta us-shine group inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-bold text-white"
                >
                  {t('nav.about')}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/shop"
                  className="us-cta inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand px-8 py-3 text-sm font-bold text-brand transition-colors duration-300 hover:bg-brand hover:text-white"
                >
                  {t('common.shopNow')}
                </Link>
              </div>
            </Reveal>

            <motion.div
              initial={{ opacity: 0, y: 32, rotate: 1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              whileHover={{ rotate: -0.5, scale: 1.01 }}
              className="us-shine relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-mist shadow-[0_40px_90px_-40px_rgba(0,0,0,0.5)]"
            >
              <Image
                fill
                src="/images/optimized/IMG_5549-card.webp"
                alt="UNIQUE STUDIOS — premium knitwear"
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority={false}
                loading="lazy"
                className="object-cover transition-transform duration-[1.4s] ease-out hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="us-glass inline-block rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                  {isAr ? 'انضم للحركة' : 'Join the movement'}
                </p>
                <p className="mt-3 text-lg font-bold leading-snug text-white sm:text-xl">
                  {t('home.joinMovement')}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ------------------------------------------------ FINAL CTA */}
        <section className="bg-white px-5 pb-20 sm:px-8 sm:pb-28">
          <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-black px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <div className="us-glow absolute -left-20 -top-20 h-72 w-72 rounded-full" aria-hidden />
            <div className="us-glow absolute -bottom-24 -right-16 h-80 w-80 rounded-full" aria-hidden />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative"
            >
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                {isAr ? 'جاهز؟' : 'Ready when you are'}
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                {isAr ? 'ستايلك يبدأ من هنا' : 'Your fit is one click away.'}
              </h2>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="us-cta us-shine group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-10 py-4 text-sm font-bold text-black sm:w-auto"
                >
                  {t('common.shopNow')}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-10 py-4 text-sm font-bold text-white transition-colors duration-300 hover:bg-white/10 sm:w-auto"
                >
                  {isAr ? 'تتبع طلبك' : 'Track your order'}
                </Link>
              </div>
            </motion.div>
          </Reveal>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

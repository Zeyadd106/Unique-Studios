'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronRight,
  Home,
  Package,
  RotateCcw,
  Ruler,
  Shirt,
  Sparkles,
  Truck,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CollectionProductCard } from '@/components/collection/collection-product-card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'

/* ---------------------------------------------------------------------------
 * Off-shoulder collection — cinematic drop experience:
 * parallax hero → marquee → sticky filter toolbar → animated grid →
 * fit guide strip → sister collections → final CTA.
 * ------------------------------------------------------------------------- */

/** Shape returned by `/api/collections/[name]`. */
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
  { value: 'featured', labelKey: 'collection.featured' },
  { value: 'newest', labelKey: 'collection.newest' },
  { value: 'priceLow', labelKey: 'collection.priceLow' },
  { value: 'priceHigh', labelKey: 'collection.priceHigh' },
]

type AvailabilityFilter = 'all' | 'in-stock' | 'out-of-stock'

const gridContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const gridItem: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] },
  },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.25 } },
}

export default function OffShoulderCollectionPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const isAr = locale === 'ar'

  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('featured')
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')

  useEffect(() => {
    let cancelled = false
    const fetchCollection = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/collections/off-shoulder', {
          cache: 'no-store',
        })
        const data = await response.json()
        if (!cancelled) setCollection(data)
      } catch (error) {
        console.error('Error fetching off-shoulder collection:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchCollection()
    return () => {
      cancelled = true
    }
  }, [])

  const products = useMemo(() => collection?.products ?? [], [collection])

  const sortedProducts = useMemo(() => {
    const list = [...products]
    switch (sortBy) {
      case 'newest':
        return list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case 'priceLow':
        return list.sort(
          (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
        )
      case 'priceHigh':
        return list.sort(
          (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
        )
      default:
        return list.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }
  }, [products, sortBy])

  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((product) => {
      if (availability === 'in-stock' && !product.available) return false
      if (availability === 'out-of-stock' && product.available) return false
      return true
    })
  }, [sortedProducts, availability])

  const inStockCount = products.filter((product) => product.available).length
  const fromPrice = products.length
    ? Math.min(...products.map((p) => p.salePrice ?? p.price))
    : 0

  const availabilityOptions: Array<{
    value: AvailabilityFilter
    labelKey: string
    count: number
  }> = [
    { value: 'all', labelKey: 'collection.all', count: products.length },
    { value: 'in-stock', labelKey: 'product.inStock', count: inStockCount },
    {
      value: 'out-of-stock',
      labelKey: 'product.outOfStock',
      count: products.length - inStockCount,
    },
  ]

  const resetFilters = () => {
    setAvailability('all')
    setSortBy('featured')
  }

  const fitFeatures = [
    {
      Icon: Ruler,
      title: isAr ? 'مقاسات S / M / L' : 'Sizes S / M / L',
      text: isAr ? 'جدول مقاسات دقيق لكل قطعة.' : 'Weight-based size chart on every product.',
    },
    {
      Icon: Shirt,
      title: isAr ? 'خامة ناعمة' : 'Soft ribbed fabric',
      text: isAr ? 'قطن مريح بفنش نضيف.' : 'Relaxed feminine fit, clean stitching.',
    },
    {
      Icon: Truck,
      title: isAr ? 'توصيل سريع' : 'Fast COD delivery',
      text: isAr ? 'ادفع كاش لما تستلم.' : 'Cash on delivery, 2–5 business days.',
    },
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

      <main className="flex-1">
        {/* -------------------------------------------------- HERO */}
        <section className="relative isolate overflow-hidden bg-black text-white">
          <div className="us-kenburns absolute inset-0">
            <Image
              src="/images/products/off shoulder/IMG_5635.JPG.jpeg"
              alt={collection?.category.name ?? 'Off Shoulder'}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-60"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          <div className="us-glow absolute -top-20 end-10 h-80 w-80 rounded-full opacity-60" aria-hidden />
          <div
            aria-hidden
            className="us-text-stroke pointer-events-none absolute bottom-4 end-4 select-none text-[22vw] font-bold leading-none tracking-tighter opacity-30 lg:text-[12rem]"
          >
            OS
          </div>

          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
            <motion.nav
              aria-label="Breadcrumb"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-8 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/60"
            >
              <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-white">
                <Home className="h-3.5 w-3.5" aria-hidden />
                {t('nav.home')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
              <Link href="/categories" className="transition-colors hover:text-white">
                {t('nav.categories')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
              <span className="text-white">{t('nav.offShoulder')}</span>
            </motion.nav>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-3"
            >
              <span className="us-glass us-float inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                {t('collection.title').toUpperCase()}
              </span>
              <span className="us-glass us-float us-float-delay inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                <Package className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                {loading ? '…' : `${products.length} ${t('collection.pieces')}`}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-6 max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl"
            >
              {collection?.category.name ?? t('nav.offShoulder')}
              <span className="us-gradient-text block">
                {isAr ? 'أنوثة بستايل جريء' : 'Soft statement fits.'}
              </span>
            </motion.h1>

            {collection?.category.description && (
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
                className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base"
              >
                {collection.category.description}
              </motion.p>
            )}

            <motion.dl
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
              className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-white/20 pt-7"
            >
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {isAr ? 'قطعة' : 'Pieces'}
                </dt>
                <dd className="mt-1 text-3xl font-bold">{loading ? '…' : products.length}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {isAr ? 'متاح' : 'In stock'}
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-3xl font-bold">
                  <Check className="h-5 w-5 text-green-400" aria-hidden />
                  {loading ? '…' : inStockCount}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {isAr ? 'يبدأ من' : 'From'}
                </dt>
                <dd className="mt-1 text-3xl font-bold">
                  {loading ? '…' : `EGP ${fromPrice.toLocaleString()}`}
                </dd>
              </div>
            </motion.dl>
          </div>
        </section>

        {/* -------------------------------------------------- MARQUEE */}
        <div className="overflow-hidden border-y border-black bg-black py-3.5" aria-hidden>
          <div className="us-marquee-track items-center gap-8 text-xs font-bold tracking-[0.3em] text-white">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className={i % 2 === 1 ? 'text-amber-300' : ''}>
                  {isAr ? 'أوف شولدر' : 'OFF-SHOULDER'}
                </span>
                <Sparkles className="h-3.5 w-3.5 text-white/40" aria-hidden />
              </span>
            ))}
          </div>
        </div>

        {/* -------------------------------------------------- TOOLBAR */}
        <div className="us-toolbar sticky top-16 z-30 border-b border-brand-line/70 sm:top-[4.5rem]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 px-5 py-3.5 sm:px-8">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('filters.availability')}>
              {availabilityOptions.map((option) => {
                const selected = availability === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setAvailability(option.value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 ${
                      selected
                        ? 'us-pill-active border-black bg-black text-white'
                        : 'border-brand-line bg-white text-ink hover:border-brand'
                    }`}
                  >
                    {t(option.labelKey)}
                    <span
                      className={`rounded-full px-1.5 text-[11px] ${
                        selected ? 'bg-white/20 text-white' : 'bg-brand-mist text-ink/60'
                      }`}
                    >
                      {option.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="ms-auto flex flex-wrap items-center gap-2" role="group" aria-label={t('common.sort')}>
              {SORT_OPTIONS.map((option) => {
                const selected = sortBy === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSortBy(option.value)}
                    className={`rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-300 ${
                      selected
                        ? 'us-pill-active border-amber-400 bg-amber-300 text-black'
                        : 'border-brand-line bg-white text-ink/70 hover:border-brand hover:text-ink'
                    }`}
                  >
                    {t(option.labelKey)}
                  </button>
                )
              })}
              {(availability !== 'all' || sortBy !== 'featured') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-ink/60 underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  {t('common.clear')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------- GRID */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="mb-7 text-sm text-ink/60" aria-live="polite">
              {loading ? (
                t('common.loading')
              ) : (
                <>
                  <strong className="font-bold text-ink">{filteredProducts.length}</strong>{' '}
                  {filteredProducts.length === 1 ? t('collection.piece') : t('collection.pieces')}
                </>
              )}
            </p>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="vg-skeleton aspect-[4/5] rounded-2xl"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="rounded-[2rem] border border-brand-line bg-brand-mist/40 px-6 py-20 text-center"
              >
                <p className="text-ink/60">{t('collection.noProducts')}</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="us-cta mt-6 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-bold text-white"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  {t('common.clear')}
                </button>
              </motion.div>
            ) : (
              <motion.div
                variants={gridContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={gridItem}
                      layout
                      exit="exit"
                      className="us-card-enter rounded-2xl"
                    >
                      <CollectionProductCard product={product} locale={locale} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </section>

        {/* -------------------------------------------------- FIT STRIP */}
        <section className="border-y border-brand-line bg-brand-mist/50 py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-3 sm:px-8">
            {fitFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: 'easeOut' }}
                className="flex items-start gap-4"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                  <feature.Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{feature.title}</span>
                  <span className="mt-1 block text-sm text-ink/60">{feature.text}</span>
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------- SISTERS */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-10 text-center"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-ink/50">
                {isAr ? 'كمل اللوك' : 'Complete the fit'}
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {isAr ? 'قطع تكمل بعضها' : 'Pairs well with.'}
              </h2>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  href: '/collections/crewnecks',
                  name: 'CREWNECKS',
                  image: '/images/optimized/IMG_5546-card.webp',
                  tag: isAr ? 'توب تقيل' : 'Heavyweight tops',
                },
                {
                  href: '/collections/sweatpants',
                  name: 'SWEATPANTS',
                  image: '/images/optimized/IMG_5544-card.webp',
                  tag: isAr ? 'راحة كل يوم' : 'Everyday comfort',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                >
                  <Link
                    href={item.href}
                    className="us-shine group relative block overflow-hidden rounded-[1.75rem]"
                  >
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        fill
                        src={item.image}
                        alt={item.name}
                        sizes="(max-width: 640px) 100vw, 50vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300">
                          {item.tag}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{item.name}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black opacity-0 transition-all duration-500 group-hover:opacity-100">
                        {t('common.viewCollection')}
                        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- FINAL CTA */}
        <section className="px-5 pb-20 sm:px-8 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-black px-6 py-16 text-center text-white sm:px-12 sm:py-20"
          >
            <div className="us-glow absolute -left-20 -top-20 h-72 w-72 rounded-full" aria-hidden />
            <div className="us-glow absolute -bottom-24 -right-16 h-80 w-80 rounded-full" aria-hidden />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                {isAr ? 'ستايل يميزك' : 'Made to stand out'}
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                {isAr ? 'اطلبي قطعتك دلوقتي' : 'Get your off-shoulder today.'}
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
                  href="/size-guide"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/30 px-10 py-4 text-sm font-bold text-white transition-colors duration-300 hover:bg-white/10 sm:w-auto"
                >
                  {isAr ? 'دليل المقاسات' : 'Size guide'}
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

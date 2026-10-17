'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Home,
  Layers,
  Package,
  Sparkles,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'

/* ---------------------------------------------------------------------------
 * Categories — cinematic editorial index:
 * parallax hero → marquee → alternating collection chapters → final CTA.
 * ------------------------------------------------------------------------- */

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  _count: { products: number }
}

const FALLBACK_COVERS: Record<string, string> = {
  'off-shoulder': '/images/products/off shoulder/IMG_5635.JPG.jpeg',
  sweatpants: '/images/products/sweatpants/IMG_5611.JPG.jpeg',
  'round-neck': '/images/optimized/IMG_5546-card.webp',
  crewnecks: '/images/optimized/IMG_5546-card.webp',
  knitwear: '/images/optimized/IMG_5549-card.webp',
}

function coverFor(category: Category): string {
  return (
    category.image ??
    FALLBACK_COVERS[category.slug] ??
    '/images/optimized/IMG_5531-card.webp'
  )
}

/** Shop link for a category (crewneck catalog slug → crewnecks page). */
function shopHref(slug: string): string {
  if (slug === 'round-neck') return '/collections/crewnecks'
  if (slug === 'crewnecks') return '/collections/crewnecks'
  if (slug === 'off-shoulder') return '/collections/off-shoulder'
  if (slug === 'sweatpants') return '/collections/sweatpants'
  return `/shop?category=${slug}`
}

const rowContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const rowItem: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] },
  },
}

export default function CategoriesPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const isAr = locale === 'ar'

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      const run = async () => {
        try {
          const response = await fetch('/api/categories')
          const data = await response.json()
          setCategories(Array.isArray(data) ? data : data.categories ?? [])
        } catch (error) {
          console.error('Error fetching categories:', error)
        } finally {
          setLoading(false)
        }
      }
      run()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const totalPieces = useMemo(
    () => categories.reduce((sum, c) => sum + c._count.products, 0),
    [categories]
  )

  const [featured, ...rest] = categories

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
              src="/images/optimized/IMG_5546-gallery.webp"
              alt=""
              aria-hidden
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-50"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
          <div className="us-glow absolute -top-24 end-0 h-96 w-96 rounded-full opacity-60" aria-hidden />
          <div
            aria-hidden
            className="us-text-stroke pointer-events-none absolute bottom-2 end-4 select-none text-[24vw] font-bold leading-none tracking-tighter opacity-30 lg:text-[13rem]"
          >
            {String(categories.length || 4).padStart(2, '0')}
          </div>

          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
            {/* Breadcrumb */}
            <motion.nav
              aria-label="Breadcrumb"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mb-8 flex items-center gap-2 text-xs font-semibold text-white/60"
            >
              <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-white">
                <Home className="h-3.5 w-3.5" aria-hidden />
                {t('nav.home')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
              <span className="text-white">{t('nav.categories')}</span>
            </motion.nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-3"
            >
              <span className="us-glass us-float inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                <Layers className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                {t('filters.allCategories').toUpperCase()}
              </span>
              <span className="us-glass us-float us-float-delay inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                {isAr ? '٤ مجموعات أساسية' : '4 core collections'}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-6 max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl"
            >
              {t('nav.categories')}
              <span className="us-gradient-text block">
                {isAr ? 'اختر ستايلك' : 'Pick your uniform.'}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
              className="mt-6 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base"
            >
              {isAr
                ? 'كل مجموعة مصممة بخامة تقيلة وفنش نضيف — اختر القطعة اللي تمثّلك.'
                : 'Discover our collections. Every piece is crafted with attention to detail and made for those who dare to stand out.'}
            </motion.p>

            {/* Stats */}
            <motion.dl
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
              className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/20 pt-7"
            >
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {isAr ? 'مجموعات' : 'Collections'}
                </dt>
                <dd className="mt-1 text-3xl font-bold">
                  {loading ? '…' : categories.length}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {isAr ? 'قطعة' : 'Pieces'}
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-3xl font-bold">
                  <Package className="h-5 w-5 text-amber-300" aria-hidden />
                  {loading ? '…' : totalPieces}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {isAr ? 'الدفع' : 'Payment'}
                </dt>
                <dd className="mt-1 text-3xl font-bold">COD</dd>
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
                  {isAr ? 'تسوّق المجموعات' : 'SHOP THE COLLECTIONS'}
                </span>
                <Sparkles className="h-3.5 w-3.5 text-white/40" aria-hidden />
              </span>
            ))}
          </div>
        </div>

        {/* -------------------------------------------------- CHAPTERS */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            {loading ? (
              <div className="space-y-10">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="vg-skeleton h-72 rounded-[2rem] sm:h-96"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-[2rem] border border-brand-line bg-brand-mist/40 px-6 py-20 text-center">
                <p className="text-ink/60">{t('common.noResults')}</p>
                <Link
                  href="/shop"
                  className="us-cta mt-6 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-bold text-white"
                >
                  {t('common.shopNow')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Link>
              </div>
            ) : (
              <div>
                {/* Featured — full-bleed cinematic banner */}
                {featured && (
                  <FeaturedBanner category={featured} t={t} isAr={isAr} />
                )}

                {/* Remaining — alternating editorial rows */}
                <motion.div
                  variants={rowContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.05 }}
                  className="mt-8 space-y-8 sm:mt-12 sm:space-y-12"
                >
                  {rest.map((category, i) => (
                    <motion.article
                      key={category.id}
                      variants={rowItem}
                      className={`us-row-line group overflow-hidden rounded-[2rem] border transition-shadow duration-500 hover:shadow-[0_36px_80px_-32px_rgba(0,0,0,0.5)] ${
                        i % 2 === 1
                          ? 'border-white/10 bg-black text-white'
                          : 'border-brand-line bg-white'
                      }`}
                    >
                      <Link
                        href={shopHref(category.slug)}
                        aria-label={category.name}
                        className={`grid lg:grid-cols-2 ${i % 2 === 1 ? '' : ''}`}
                      >
                        {/* Image */}
                        <div
                          className={`relative min-h-72 overflow-hidden sm:min-h-96 ${
                            i % 2 === 1 ? 'lg:order-2' : ''
                          }`}
                        >
                          <Image
                            fill
                            src={coverFor(category)}
                            alt={category.name}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            loading="lazy"
                            className="us-cover-drift object-cover"
                          />
                          <div
                            className={`absolute inset-0 ${
                              i % 2 === 1
                                ? 'bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/40'
                                : 'bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-black/40'
                            }`}
                          />
                          <span className="us-glass absolute end-5 top-5 rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-[0.2em] text-white">
                            0{i + 2}
                          </span>
                        </div>

                        {/* Content */}
                        <div
                          className={`relative flex flex-col justify-center gap-5 p-8 sm:p-12 ${
                            i % 2 === 1 ? 'lg:order-1' : ''
                          }`}
                        >
                          <div
                            aria-hidden
                            className={`pointer-events-none absolute end-6 top-4 select-none text-7xl font-bold leading-none tracking-tighter sm:text-8xl ${
                              i % 2 === 1 ? 'text-white/[0.07]' : 'text-black/[0.05]'
                            }`}
                          >
                            0{i + 2}
                          </div>
                          <p
                            className={`text-[11px] font-bold uppercase tracking-[0.25em] ${
                              i % 2 === 1 ? 'text-amber-300' : 'text-ink/50'
                            }`}
                          >
                            {isAr ? 'مجموعة' : 'Chapter'} 0{i + 2}
                          </p>
                          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                            {category.name}
                          </h2>
                          {category.description && (
                            <p
                              className={`max-w-md text-sm leading-relaxed sm:text-base ${
                                i % 2 === 1 ? 'text-white/70' : 'text-ink/60'
                              }`}
                            >
                              {category.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={`us-count-pill inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ${
                                i % 2 === 1
                                  ? 'bg-white/10 text-white'
                                  : 'bg-brand-mist text-ink'
                              }`}
                            >
                              <Package className="h-3.5 w-3.5" aria-hidden />
                              {category._count.products}{' '}
                              {category._count.products === 1
                                ? t('collection.piece')
                                : t('collection.pieces')}
                            </span>
                          </div>
                          <span
                            className={`mt-2 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-all duration-300 group-hover:gap-3.5 ${
                              i % 2 === 1
                                ? 'bg-white text-black group-hover:bg-amber-300'
                                : 'bg-black text-white group-hover:bg-brand-hover'
                            }`}
                          >
                            {t('common.viewCollection')}
                            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                          </span>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </motion.div>
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------------------------- FINAL CTA */}
        {!loading && categories.length > 0 && (
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
                  {isAr ? 'مش عارف تختار؟' : "Can't decide?"}
                </p>
                <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                  {isAr ? 'تصفح كل القطع مرة واحدة' : 'Shop every piece in one place.'}
                </h2>
                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/shop"
                    className="us-cta us-shine group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-10 py-4 text-sm font-bold text-black sm:w-auto"
                  >
                    {t('common.shopAll')}
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
        )}
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

/* Featured first category — full-bleed cinematic banner */
function FeaturedBanner({
  category,
  t,
  isAr,
}: {
  category: Category
  t: (key: string) => string
  isAr: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <Link
        href={shopHref(category.slug)}
        aria-label={category.name}
        className="us-shine group relative block overflow-hidden rounded-[2rem] shadow-[0_36px_80px_-32px_rgba(0,0,0,0.55)]"
      >
        <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
          <Image
            fill
            src={coverFor(category)}
            alt={category.name}
            sizes="100vw"
            priority={false}
            className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-5 p-7 sm:p-12">
          <div className="max-w-xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-black">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {isAr ? 'مجموعة مميزة' : 'Featured collection'}
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {category.name}
            </h2>
            {category.description && (
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                {category.description}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition-all duration-300 group-hover:gap-3.5 group-hover:bg-amber-300">
            {t('common.viewCollection')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </span>
        </div>
        <span className="us-glass absolute end-6 top-6 rounded-full px-3.5 py-1.5 text-xs font-bold text-white">
          {category._count.products}{' '}
          {category._count.products === 1 ? t('collection.piece') : t('collection.pieces')}
        </span>
      </Link>
    </motion.div>
  )
}

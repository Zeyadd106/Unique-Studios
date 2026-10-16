'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/product/product-card'
import { ReviewsSection } from '@/components/product/reviews'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import type { Product } from '@/types'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Flame,
  Heart,
  Minus,
  Plus,
  RefreshCcw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react'

/* ---------------------------------------------------------------------------
 * Product page — cinematic buy experience (serves every product, including
 * the sweatpants drop):
 * breadcrumb → crossfading gallery + sticky buy panel (color, size, stock,
 * quantity) → trust strip → accordions → related fits → reviews.
 * ------------------------------------------------------------------------- */

interface VariantImage {
  id: string
  imageUrl: string
  alt?: string | null
  sortOrder: number
  isPrimary?: boolean
}

interface VariantByColor {
  id: string
  colorName: string
  colorCode?: string | null
  available: boolean
  images: VariantImage[]
}

interface ProductDetailData {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  categoryId: string
  category: {
    id: string
    name: string
    slug: string
    description?: string | null
    image?: string | null
    active: boolean
  }
  material?: string | null
  fit?: string | null
  careInstructions?: string | null
  featured: boolean
  bestSeller: boolean
  newArrival: boolean
  active: boolean
  images: Array<{
    id: string
    url: string
    cardUrl?: string | null
    thumbUrl?: string | null
    alt?: string | null
    sortOrder: number
    isPrimary?: boolean
    createdAt: Date
  }>
  variants: Array<{
    id: string
    productId: string
    size: string
    color: string
    stock: number
    weightMin: number | null
    weightMax: number | null
    createdAt: Date
    updatedAt: Date
  }>
  variantsByColor: VariantByColor[]
  createdAt: Date
  updatedAt: Date
}

interface RatingSummary {
  average: number
  count: number
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 0.61, 0.36, 1] },
  },
}

function Stars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${className} ${
            i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-ink/25'
          }`}
          aria-hidden
        />
      ))}
    </span>
  )
}

export default function ProductPage() {
  const params = useParams()
  const { locale, setLocale, direction } = useLocale()
  const { t } = useTranslation()
  const { cartCount, addToCart } = useCart()
  const { wishlistCount, addToWishlist, isInWishlist } = useWishlist()
  const isAr = locale === 'ar'

  const slug = typeof params.slug === 'string' ? params.slug : ''

  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [showBar, setShowBar] = useState(false)
  const [rating, setRating] = useState<RatingSummary | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [openAccordion, setOpenAccordion] = useState<string | null>('details')

  useEffect(() => {
    let cancelled = false
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/product?slug=${slug}`)
        const data = await response.json()
        if (cancelled || !data?.id) {
          if (!cancelled) setProduct(null)
          return
        }
        if (cancelled) return
        setProduct(data as ProductDetailData)

        const firstVariant = data.variantsByColor?.[0]
        if (firstVariant) {
          setSelectedColor(firstVariant.colorName)
          const firstSize = (data.variants as ProductDetailData['variants'])
            .filter((v) => v.color === firstVariant.colorName)
            .sort((a, b) => b.stock - a.stock)[0]
          setSelectedSize(firstSize?.size ?? '')
        }
        setSelectedImage(0)
        setQuantity(1)

        // Rating summary + related fits load alongside.
        try {
          const [ratingRes, relatedRes] = await Promise.all([
            fetch(`/api/reviews?productId=${data.id}`),
            fetch(`/api/products?category=${data.category.slug}`),
          ])
          if (cancelled) return
          const ratingData = await ratingRes.json()
          if (ratingData?.summary) setRating(ratingData.summary as RatingSummary)
          const relatedData = await relatedRes.json()
          if (Array.isArray(relatedData)) {
            setRelated(
              (relatedData as Product[]).filter((p) => p.id !== data.id).slice(0, 4)
            )
          }
        } catch {
          // Non-fatal — the buy panel works without these.
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProduct()
    return () => {
      cancelled = true
    }
  }, [slug])

  // Sticky mobile buy bar appears after scrolling past the gallery.
  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 620)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const currentVariant = product?.variantsByColor.find(
    (variant) => variant.colorName === selectedColor
  )

  const galleryImages = useMemo(
    () =>
      currentVariant?.images.map((image) => ({
        id: image.id,
        productId: product?.id ?? '',
        url: image.imageUrl,
        thumbUrl: image.imageUrl,
        alt: image.alt ?? product?.name ?? '',
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
        createdAt: new Date(),
      })) ?? [],
    [currentVariant, product?.id, product?.name]
  )

  const activeImage = galleryImages[selectedImage] ?? galleryImages[0]

  const sizesForColor = useMemo(() => {
    if (!product) return []
    const seen = new Map<string, { size: string; stock: number; weightMin: number | null; weightMax: number | null }>()
    for (const v of product.variants) {
      if (v.color !== selectedColor) continue
      const existing = seen.get(v.size)
      if (!existing || v.stock > existing.stock) {
        seen.set(v.size, { size: v.size, stock: v.stock, weightMin: v.weightMin, weightMax: v.weightMax })
      }
    }
    return [...seen.values()]
  }, [product, selectedColor])

  const selectedVariant = sizesForColor.find((s) => s.size === selectedSize)
  const currentStock = selectedVariant?.stock ?? 0
  const isOutOfStock = !currentVariant || currentStock <= 0
  const isLowStock = !isOutOfStock && currentStock <= 5

  const format = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const isOnSale = Boolean(product?.salePrice)
  const discountPct =
    product && product.salePrice
      ? Math.round((1 - product.salePrice / product.price) * 100)
      : 0

  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName)
    setSelectedImage(0)
    setQuantity(1)
    const firstSize = product?.variants
      .filter((v) => v.color === colorName)
      .sort((a, b) => b.stock - a.stock)[0]
    setSelectedSize(firstSize?.size ?? '')
  }

  const handleAddToCart = () => {
    if (!product || !currentVariant || !selectedSize || isOutOfStock) return
    const unit = product.salePrice ?? product.price
    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: currentVariant.images[0]?.imageUrl ?? product.images[0]?.url ?? '',
      size: selectedSize,
      color: selectedColor,
      quantity,
      unitPrice: unit,
      totalPrice: quantity * unit,
    })
    setJustAdded(true)
    const timer = setTimeout(() => setJustAdded(false), 1800)
    return () => clearTimeout(timer)
  }

  const handleAddToWishlist = () => {
    if (!product) return
    if (isInWishlist(product.id)) return
    addToWishlist(product.id)
  }

  const handleQuantityChange = (delta: number) => {
    const cap = Math.max(1, Math.min(10, currentStock || 10))
    const next = quantity + delta
    if (next >= 1 && next <= cap) setQuantity(next)
  }

  const toggleWishlist = (id: string) => {
    if (!isInWishlist(id)) addToWishlist(id)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header locale={locale} setLocale={setLocale} cartCount={cartCount} wishlistCount={wishlistCount} t={t} />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div className="vg-skeleton aspect-[4/5] rounded-[2rem]" />
              <div className="space-y-4">
                <div className="vg-skeleton h-8 w-2/3 rounded-full" />
                <div className="vg-skeleton h-4 w-1/3 rounded-full" />
                <div className="vg-skeleton h-12 w-full rounded-2xl" />
                <div className="vg-skeleton h-24 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer locale={locale} t={t} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header locale={locale} setLocale={setLocale} cartCount={cartCount} wishlistCount={wishlistCount} t={t} />
        <main className="flex-1">
          <div className="mx-auto max-w-md px-4 py-24 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink"
            >
              <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" aria-hidden />
              {t('common.back')}
            </Link>
            <h2 className="mt-6 text-xl font-bold">{t('errors.productNotFound')}</h2>
          </div>
        </main>
        <Footer locale={locale} t={t} />
      </div>
    )
  }

  const accordions = [
    {
      id: 'details',
      title: t('product.details'),
      body: (
        <dl className="space-y-2.5 text-sm">
          {product.material && (
            <div className="flex gap-3">
              <dt className="w-36 shrink-0 text-ink/50">{t('product.material')}</dt>
              <dd className="font-semibold text-ink">{product.material}</dd>
            </div>
          )}
          {product.fit && (
            <div className="flex gap-3">
              <dt className="w-36 shrink-0 text-ink/50">{t('product.fit')}</dt>
              <dd className="font-semibold text-ink">{product.fit}</dd>
            </div>
          )}
          {product.careInstructions && (
            <div className="flex gap-3">
              <dt className="w-36 shrink-0 text-ink/50">{t('product.careInstructions')}</dt>
              <dd className="font-semibold text-ink">{product.careInstructions}</dd>
            </div>
          )}
          <div className="flex gap-3">
            <dt className="w-36 shrink-0 text-ink/50">{t('product.sizeGuide')}</dt>
            <dd>
              <Link href="/size-guide" className="font-bold underline underline-offset-4 hover:text-brand-deep">
                {t('sizeGuide.title')}
              </Link>
            </dd>
          </div>
        </dl>
      ),
    },
    {
      id: 'shipping',
      title: isAr ? 'الشحن والدفع' : 'Shipping & payment',
      body: (
        <p className="text-sm leading-relaxed text-ink/75">
          {isAr
            ? 'التوصيل خلال ٢-٥ أيام عمل لأي مكان في مصر، والدفع كاش عند الاستلام. فريقنا بيتصل بيك للتأكيد خلال ٢٤ ساعة.'
            : 'Delivery in 2–5 business days anywhere in Egypt. Cash on delivery — our team calls to confirm within 24 hours.'}
        </p>
      ),
    },
    {
      id: 'exchange',
      title: isAr ? 'الاستبدال' : 'Exchange & returns',
      body: (
        <p className="text-sm leading-relaxed text-ink/75">
          {isAr
            ? 'استبدال المقاس مجاناً خلال ١٤ يوم بشرط عدم الاستخدام ووجود التكت.'
            : 'Free size exchange within 14 days — unworn, tags attached. See the Exchange & Returns page for details.'}
        </p>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header locale={locale} setLocale={setLocale} cartCount={cartCount} wishlistCount={wishlistCount} t={t} />

      <main className="flex-1 pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Breadcrumb */}
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-wrap items-center gap-2 py-6 text-xs font-semibold text-ink/50"
          >
            <Link href="/" className="transition-colors hover:text-ink">{t('nav.home')}</Link>
            <span aria-hidden className="text-ink/30">›</span>
            <Link href="/shop" className="transition-colors hover:text-ink">{t('nav.shop')}</Link>
            <span aria-hidden className="text-ink/30">›</span>
            <Link href={`/shop?category=${product.category.slug}`} className="transition-colors hover:text-ink">
              {product.category.name}
            </Link>
            <span aria-hidden className="text-ink/30">›</span>
            <span className="text-ink">{product.name}</span>
          </motion.nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            {/* ------------------------------------------ GALLERY */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className={direction === 'rtl' ? 'lg:order-2' : 'lg:order-1'}
            >
              <div className="lg:sticky lg:top-32">
                <div className="us-shine group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-mist shadow-[0_36px_80px_-36px_rgba(0,0,0,0.5)]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage?.id ?? 'empty'}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className="absolute inset-0"
                    >
                      {activeImage && (
                        <Image
                          src={activeImage.url}
                          alt={activeImage.alt}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute start-4 top-4 flex flex-col gap-2">
                    {product.newArrival && (
                      <span className="rounded-full bg-black px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                        {t('product.new')}
                      </span>
                    )}
                    {isOnSale && (
                      <span className="rounded-full bg-amber-300 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black">
                        −{discountPct}%
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToWishlist}
                    disabled={isInWishlist(product.id)}
                    aria-label={t('product.addToWishlist')}
                    aria-pressed={isInWishlist(product.id)}
                    className={`absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur transition-all duration-300 hover:scale-110 ${
                      isInWishlist(product.id)
                        ? 'bg-black text-white'
                        : 'bg-white/90 text-ink hover:bg-white'
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-amber-300 text-amber-300' : ''}`}
                      aria-hidden
                    />
                  </button>
                </div>

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {galleryImages.map((image, i) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setSelectedImage(i)}
                        aria-label={`View ${i + 1}`}
                        aria-pressed={selectedImage === i}
                        className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-mist transition-all duration-300 hover:scale-105 ${
                          selectedImage === i ? 'us-thumb-active' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image src={image.thumbUrl || image.url} alt="" fill sizes="64px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* ------------------------------------------ BUY PANEL */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.1 }}
              className={direction === 'rtl' ? 'lg:order-1' : 'lg:order-2'}
            >
              <div className="lg:sticky lg:top-32">
                <div className="flex flex-wrap items-center gap-2">
                  {product.newArrival && (
                    <span className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                      {t('product.new')}
                    </span>
                  )}
                  {product.bestSeller && (
                    <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
                      {t('product.bestSeller')}
                    </span>
                  )}
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                    {product.category.name}
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                  {product.name}
                </h1>

                {/* Rating */}
                <button
                  type="button"
                  onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group mt-3 flex items-center gap-2"
                >
                  <Stars value={rating?.average ?? 5} />
                  <span className="text-sm font-semibold text-ink/60 group-hover:text-ink group-hover:underline group-hover:underline-offset-4">
                    {rating ? `${rating.average} · ${rating.count} ${t('reviews.basedOn')}` : t('reviews.noReviews')}
                  </span>
                </button>

                {/* Price */}
                <div className="mt-5 flex flex-wrap items-baseline gap-3">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={product.salePrice ?? product.price}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="text-4xl font-bold tracking-tight text-ink"
                    >
                      {format(product.salePrice ?? product.price)}
                    </motion.span>
                  </AnimatePresence>
                  {isOnSale && (
                    <span className="text-lg text-ink/40 line-through">{format(product.price)}</span>
                  )}
                </div>
                <p className={`mt-2 flex items-center gap-1.5 text-[13px] font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-700'}`}>
                  {isOutOfStock ? (
                    t('product.outOfStock')
                  ) : isLowStock ? (
                    <>
                      <Flame className="h-4 w-4" aria-hidden />
                      {isAr ? `باقي ${currentStock} بس!` : `Only ${currentStock} left!`}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      {t('product.inStock')}
                    </>
                  )}
                </p>

                <p className="mt-5 text-sm leading-relaxed text-ink/75 sm:text-base">
                  {product.description}
                </p>

                {/* Color */}
                <div className="mt-7">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
                    {t('product.color')} — <span className="text-ink">{selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variantsByColor.map((variant) => {
                      const selected = selectedColor === variant.colorName
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          aria-pressed={selected}
                          disabled={!variant.available}
                          onClick={() => handleSelectColor(variant.colorName)}
                          className={`rounded-full border px-5 py-2.5 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-35 ${
                            selected
                              ? 'us-size-active border-black bg-black text-white'
                              : 'border-brand-line bg-white text-ink hover:border-black'
                          }`}
                        >
                          {variant.colorName}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Size */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
                      {t('product.size')}
                      {selectedSize && <span className="text-ink"> — {selectedSize}</span>}
                    </p>
                    <Link href="/size-guide" className="flex items-center gap-1 text-xs font-bold text-ink/60 underline-offset-4 hover:text-ink hover:underline">
                      <Ruler className="h-3.5 w-3.5" aria-hidden />
                      {t('sizeGuide.title')}
                    </Link>
                  </div>
                  <div className="grid grid-cols-5 gap-2.5">
                    {sizesForColor.map(({ size, stock }) => {
                      const selected = selectedSize === size
                      const empty = stock <= 0
                      return (
                        <button
                          key={size}
                          type="button"
                          aria-pressed={selected}
                          disabled={empty}
                          onClick={() => {
                            setSelectedSize(size)
                            setQuantity(1)
                          }}
                          className={`relative rounded-2xl border py-3.5 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed ${
                            selected
                              ? 'us-size-active border-black bg-black text-white'
                              : empty
                                ? 'border-brand-line bg-brand-mist/50 text-ink/30 line-through'
                                : 'border-brand-line bg-white text-ink hover:border-black hover:scale-[1.04]'
                          }`}
                        >
                          {size}
                          {!empty && stock <= 5 && (
                            <span className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${selected ? 'bg-amber-300 text-black' : 'bg-orange-500 text-white'}`}>
                              {stock}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {selectedVariant?.weightMin != null && selectedVariant?.weightMax != null && (
                    <p className="mt-2.5 text-xs text-ink/55">
                      {t('product.weightRecommendation')}: {selectedVariant.weightMin}–{selectedVariant.weightMax} {isAr ? 'كجم' : 'kg'}
                    </p>
                  )}
                </div>

                {/* Quantity + CTA */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <div className="flex items-center justify-between rounded-full border border-brand-line px-2 py-1.5 sm:w-40">
                    <button
                      type="button"
                      aria-label={t('common.decreaseQuantity')}
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="rounded-full p-2.5 transition-colors hover:bg-brand-mist disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={quantity}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="min-w-8 text-center text-lg font-bold"
                      >
                        {quantity}
                      </motion.span>
                    </AnimatePresence>
                    <button
                      type="button"
                      aria-label={t('common.increaseQuantity')}
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= Math.max(1, Math.min(10, currentStock || 10))}
                      className="rounded-full p-2.5 transition-colors hover:bg-brand-mist disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || !selectedSize}
                    className={`us-cta us-shine flex flex-1 items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-colors ${
                      justAdded
                        ? 'bg-green-600 text-white'
                        : 'bg-black text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="h-5 w-5" aria-hidden />
                        {isAr ? 'اتضافت للسلة!' : 'Added to bag!'}
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-5 w-5" aria-hidden />
                        {isOutOfStock ? t('product.outOfStock') : t('product.addToCart')}
                      </>
                    )}
                  </button>
                </div>

                {/* Trust */}
                <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-brand-line bg-brand-mist/40 p-4 text-center">
                  {[
                    { Icon: Truck, label: isAr ? 'دفع عند الاستلام' : 'Cash on delivery' },
                    { Icon: ShieldCheck, label: isAr ? 'تأكيد خلال ٢٤ ساعة' : 'Confirmed in 24h' },
                    { Icon: RefreshCcw, label: isAr ? 'استبدال ١٤ يوم' : '14-day exchange' },
                  ].map(({ Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      <Icon className="h-5 w-5" aria-hidden />
                      <span className="text-[11px] font-bold leading-tight">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Accordions */}
                <div className="mt-6 divide-y divide-brand-line rounded-2xl border border-brand-line">
                  {accordions.map((item) => {
                    const open = openAccordion === item.id
                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setOpenAccordion(open ? null : item.id)}
                          className="flex w-full items-center justify-between px-5 py-4 text-start text-sm font-bold"
                        >
                          {item.title}
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                            aria-hidden
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.32, ease: 'easeOut' }}
                              className="us-accordion"
                            >
                              <div className="px-5 pb-5">{item.body}</div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ------------------------------------------ RELATED */}
          {related.length > 0 && (
            <section className="mt-20 sm:mt-28">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-ink/50">
                    {isAr ? 'كمل اللوك' : 'Complete the fit'}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {isAr ? 'هتعجبك برضه' : 'You may also like.'}
                  </h2>
                </div>
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="group inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline hover:underline-offset-4"
                >
                  {t('common.viewAll')}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                </Link>
              </div>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.08 } },
                }}
                className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6"
              >
                {related.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, y: 26 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] } },
                    }}
                  >
                    <ProductCard
                      product={item}
                      locale={locale}
                      newLabel={t('product.new')}
                      saleLabel={t('product.sale')}
                      isInWishlist={isInWishlist}
                      onToggleWishlist={toggleWishlist}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {/* ------------------------------------------ REVIEWS */}
          <div id="reviews" className="scroll-mt-28">
            <ReviewsSection productId={product.id} locale={locale} t={t} />
          </div>
        </div>
      </main>

      {/* Sticky mobile buy bar */}
      <AnimatePresence>
        {showBar && !loading && (
          <motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-line bg-white/92 px-4 py-3 backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{product.name}</p>
                <p className="text-sm font-bold">
                  {format(product.salePrice ?? product.price)}
                  <span className="ms-2 text-xs font-semibold text-ink/50">
                    {selectedColor} · {selectedSize || '—'}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedSize}
                className="flex shrink-0 items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden />
                {isAr ? 'أضف' : 'Add'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer locale={locale} t={t} />
    </div>
  )
}

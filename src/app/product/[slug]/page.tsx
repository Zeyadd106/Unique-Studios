'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { Heart, ShoppingBag, Minus, Plus, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/types'
import { ReviewsSection } from '@/components/product/reviews'

interface VariantColor {
  id: string
  colorName: string
  colorCode?: string | null
  primaryImage?: string | null
  available: boolean
  images: Array<{
    id: string
    imageUrl: string
    alt?: string | null
    sortOrder: number
    isPrimary: boolean
  }>
}

interface ProductDetailData {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  categoryId: string
  category: { id: string; name: string; slug: string; description?: string | null; image?: string | null; active: boolean }
  material?: string | null
  fit?: string | null
  careInstructions?: string | null
  featured: boolean
  bestSeller: boolean
  newArrival: boolean
  active: boolean
  images: Array<{
    id: string
    productId: string
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
  variantsByColor: VariantColor[]
  createdAt: Date
  updatedAt: Date
}

const COLOR_CODES: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  gray: '#808080',
  grey: '#808080',
  blue: '#1a2e6e',
  burgundy: '#800020',
  pink: '#e91e63',
  navy: '#000080',
  red: '#d32f2f',
  green: '#388e3c',
  yellow: '#ffd700',
  purple: '#7b1fa2',
  orange: '#f57c00',
  beige: '#d7ccc8',
  brown: '#5d4037',
  cream: '#fffdd0',
  nude: '#d1b3a2',
  gold: '#d4af37',
  silver: '#c0c0c0',
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { locale, setLocale, direction } = useLocale()
  const { t } = useTranslation()
  const { cartCount, addToCart } = useCart()
  const { wishlistCount, addToWishlist, isInWishlist } = useWishlist()

  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [zoomImage, setZoomImage] = useState<string | null>(null)

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  const fetchProduct = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/product?slug=${slug}`)
      const data = await response.json()
      setProduct(data as ProductDetailData)

      // Set default color to first available variant
      if (data.variantsByColor && data.variantsByColor.length > 0) {
        const defaultVariant = data.variantsByColor[0]
        setSelectedColor(defaultVariant.colorName)
        setSelectedVariantId(defaultVariant.id)
        setActiveImageIndex(0)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  // When color changes, reset active image index
  const handleColorChange = useCallback(
    (colorName: string, variantId: string) => {
      setSelectedColor(colorName)
      setSelectedVariantId(variantId)
      setActiveImageIndex(0)
    },
    []
  )

  const currentVariant = product?.variantsByColor.find((v) => v.colorName === selectedColor)
  const currentImages = currentVariant?.images ?? []
  const activeImage = currentImages[activeImageIndex]

  const isOutOfStock = !currentVariant || !currentVariant.available
  const getAvailableSizes = () => {
    if (!product) return []
    return [...new Set(product.variants.map((v) => v.size))].sort()
  }

  const handleAddToCart = () => {
    if (!product || !currentVariant) return
    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: activeImage?.imageUrl ?? product.images[0]?.url ?? '',
      size: 'M', // Default size
      color: selectedColor,
      quantity,
      unitPrice: product.salePrice || product.price,
      totalPrice: quantity * (product.salePrice || product.price),
    })
    router.push('/cart')
  }

  const handleAddToWishlist = () => {
    if (!product) return
    if (isInWishlist(product.id)) return
    addToWishlist(product.id)
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  const getColorCode = (colorName: string) => {
    return COLOR_CODES[colorName.toLowerCase()] || '#cccccc'
  }

  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#ffffff'
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header locale={locale} setLocale={setLocale} cartCount={cartCount} wishlistCount={wishlistCount} t={t} />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-[2/3] bg-[#F3F3F3] rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-[#F3F3F3] rounded animate-pulse" />
              <div className="h-4 bg-[#F3F3F3] rounded w-3/4 animate-pulse" />
              <div className="h-12 bg-[#F3F3F3] rounded animate-pulse" />
              <div className="h-6 bg-[#F3F3F3] rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </main>
        <Footer locale={locale} t={t} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header locale={locale} setLocale={setLocale} cartCount={cartCount} wishlistCount={wishlistCount} t={t} />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111]/60 hover:opacity-70"
            >
              <ArrowLeft className="h-4 w-4" />
              <Link href="/shop">{t('common.back')}</Link>
            </motion.div>
            <h2 className="mt-6 text-xl font-bold">{t('errors.productNotFound')}</h2>
          </div>
        </main>
        <Footer locale={locale} t={t} />
      </div>
    )
  }

  const currencyOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }
  const format = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', currencyOptions).format(value)

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} setLocale={setLocale} cartCount={cartCount} wishlistCount={wishlistCount} t={t} />

      <main className="flex-1">
        <section className="py-10 md:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="mb-8 flex items-center gap-2 text-xs text-[#111111]/50">
              <Link href="/" className="hover:opacity-70 transition-opacity">
                {t('nav.home')}
              </Link>
              <span className="text-[#111111]/30">&rsaquo;</span>
              <Link href="/shop" className="hover:opacity-70 transition-opacity">
                {t('nav.shop')}
              </Link>
              <span className="text-[#111111]/30">&rsaquo;</span>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:opacity-70 transition-opacity"
              >
                {product.category.name}
              </Link>
              <span className="text-[#111111]/30">&rsaquo;</span>
              <span className="text-[#111111]">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Gallery (left) */}
              <div className={direction === 'rtl' ? 'lg:col-span-6 lg:order-2' : 'lg:col-span-6 lg:order-1'}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Main image */}
                  <div className="relative aspect-[2/3] rounded-xl bg-[#F3F3F3] overflow-hidden">
                    {activeImage && (
                      <Image
                        fill
                        src={activeImage.imageUrl}
                        alt={activeImage.alt || product.name}
                        sizes="(max-width: 768px) 100vw, 600px"
                        priority={activeImageIndex === 0}
                        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                      />
                    )}
                    {activeImage && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    )}
                    {/* Zoom button */}
                    <button
                      type="button"
                      aria-label="Zoom image"
                      onClick={() => setZoomImage(activeImage?.imageUrl ?? null)}
                      className="absolute bottom-3 end-3 z-30 p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-all"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    {/* Nav arrows */}
                    {currentImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous image"
                          onClick={() =>
                            setActiveImageIndex((i) => (i - 1 + currentImages.length) % currentImages.length)
                          }
                          className="absolute top-1/2 start-3 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next image"
                          onClick={() =>
                            setActiveImageIndex((i) => (i + 1) % currentImages.length)
                          }
                          className="absolute top-1/2 end-3 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {currentImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {currentImages.map((img, index) => {
                        const isActive = index === activeImageIndex
                        return (
                          <button
                            key={img.id}
                            type="button"
                            aria-label={img.alt || `Image ${index + 1}`}
                            aria-pressed={isActive}
                            onClick={() => setActiveImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${
                              isActive
                                ? 'border-[#111111] scale-105'
                                : 'border-transparent hover:border-[#111111]/50'
                            } transition-all duration-200`}
                          >
                            <Image
                              fill
                              src={img.imageUrl}
                              alt={img.alt || `Image ${index + 1}`}
                              sizes="64px"
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Color swatches */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[#111111]/60 uppercase tracking-wider mb-2">
                      {t('product.color')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {product.variantsByColor.map((variant) => {
                        const isSelected = selectedColor === variant.colorName
                        const colorCode = getColorCode(variant.colorName)
                        const contrastColor = getContrastColor(colorCode)
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            aria-label={variant.colorName}
                            aria-pressed={isSelected}
                            onClick={() => handleColorChange(variant.colorName, variant.id)}
                            className={`w-10 h-10 rounded-full border-2 flex-shrink-0 transition-all duration-200 ${
                              isSelected
                                ? 'border-[#111111] ring-1 ring-[#111111] scale-105'
                                : 'border-[#111111]/30 hover:border-[#111111] hover:scale-105'
                            }`}
                            style={{
                              backgroundColor: colorCode,
                              color: contrastColor,
                            }}
                            disabled={!variant.available}
                          >
                            <span className="sr-only">{variant.colorName}</span>
                            {isSelected && variant.available && (
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {!variant.available && (
                              <span className="opacity-50">x</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Product Info (right) */}
              <div className={direction === 'rtl' ? 'lg:col-span-6 lg:order-1' : 'lg:col-span-6 lg:order-2'}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {product.newArrival && (
                        <Badge variant="default" className="uppercase text-[10px] tracking-wider">
                          {t('product.new')}
                        </Badge>
                      )}
                      {product.salePrice && (
                        <Badge variant="error" className="uppercase text-[10px] tracking-wider">
                          {t('product.sale')}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                      {product.name}
                    </h1>
                    <p className="text-sm text-[#111111]/60">
                      {product.category.name}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-3 mb-1">
                      {product.salePrice ? (
                        <>
                          <span className="text-3xl md:text-4xl font-bold">
                            {format(product.salePrice)}
                          </span>
                          <span className="text-xl text-[#111111]/40 line-through">
                            {format(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl md:text-4xl font-bold">{format(product.price)}</span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#111111]/50 mt-1">
                      {isOutOfStock ? t('product.outOfStock') : t('product.inStock')}
                    </p>
                  </div>

                  <p className="text-[#111111]/70 leading-relaxed text-sm md:text-base">
                    {product.description}
                  </p>

                  {/* Color info */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[#111111]/60 uppercase tracking-wider mb-2">
                      Available Colors
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.variantsByColor.map((v) => (
                        <span
                          key={v.id}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-medium border ${
                            selectedColor === v.colorName
                              ? 'border-[#111111] bg-[#111111] text-white'
                              : 'border-[#111111]/20 text-[#111111]/60 hover:border-[#111111]'
                          }`}
                        >
                          {v.colorName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                    >
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      {isOutOfStock ? t('product.outOfStock') : t('product.addToCart')}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleAddToWishlist}
                      disabled={isInWishlist(product.id)}
                    >
                      <Heart className={`h-5 w-5 mr-2 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      {isInWishlist(product.id) ? t('product.removeFromWishlist') : t('product.addToWishlist')}
                    </Button>
                  </div>

                  {/* Product details */}
                  <div className="border-t border-[#111111]/10 pt-6 space-y-3">
                    <h3 className="font-semibold text-sm">{t('product.details')}</h3>
                    {product.material && (
                      <div className="text-sm text-[#111111]/70">
                        <span className="text-[#111111]/40">{t('product.material')}:</span>{' '}
                        <span>{product.material}</span>
                      </div>
                    )}
                    {product.fit && (
                      <div className="text-sm text-[#111111]/70">
                        <span className="text-[#111111]/40">{t('product.fit')}:</span>{' '}
                        <span>{product.fit}</span>
                      </div>
                    )}
                    {product.careInstructions && (
                      <div className="text-sm text-[#111111]/70">
                        <span className="text-[#111111]/40 block mb-1">
                          {t('product.careInstructions')}:
                        </span>
                        {product.careInstructions}
                      </div>
                    )}
                    <Link
                      href="/size-guide"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#111111] hover:opacity-70 transition-opacity"
                    >
                      {t('product.sizeGuide')} <span>→</span>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <ReviewsSection productId={product.id} locale={locale} t={t} />
      </main>

      <Footer locale={locale} t={t} />

      {/* Zoom overlay */}
      {zoomImage && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setZoomImage(null)}
          >
            <div className="relative w-full max-w-[1000px] max-h-[calc(100vh-2rem)] rounded-xl overflow-hidden bg-white">
              <Image
                fill
                src={zoomImage}
                alt={product.name}
                sizes="100vw"
                className="absolute inset-0 h-full w-full object-contain object-center bg-white"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

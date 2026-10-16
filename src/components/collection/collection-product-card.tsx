'use client'

import Link from 'next/link'
import Image from 'next/image'

interface CollectionProductCardProps {
  product: {
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
  locale: string
}

/**
 * Collection product card — matches CAVE Egypt crewnecks collection card styling.
 *
 * - Single square product image (no hover swap, no color swatches)
 * - Product name below image
 * - "VENDOR: UNIQUE STUDIOS" in small caps
 * - Price in EGP (sale price + crossed-out regular price when on sale)
 * - Links to product detail page
 */
export function CollectionProductCard({
  product,
  locale,
}: CollectionProductCardProps) {
  const images = product.images ?? []
  const primaryImage = images.find((i) => i.isPrimary) ?? images[0]

  const productName = product.colorName
    ? `${product.name} ${product.colorName}`
    : product.name

  const format = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <article className="group">
      <Link
        href={`/product/${product.slug}`}
        aria-label={productName}
        className="block"
      >
        {/* Square product image */}
        <div className="relative aspect-square overflow-hidden rounded-sm bg-[#F3F3F3] mb-3">
          {primaryImage ? (
            <Image
              fill
              src={primaryImage.cardUrl ?? primaryImage.url}
              alt={primaryImage.alt || productName}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-[#111111]/40">
              {productName}
            </div>
          )}
        </div>

        {/* Product name */}
        <h3 className="text-base font-medium leading-tight mb-1 text-[#111111] group-hover:text-[#111111]/80 transition-colors">
          {productName}
        </h3>

        {/* Vendor */}
        <p className="text-[10px] text-[#111111]/50 uppercase tracking-widest mb-2">
          Vendor: UNIQUE STUDIOS
        </p>

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5">
          {product.salePrice ? (
            <>
              <span className="text-sm font-bold text-[#111111]">
                {format(product.salePrice)}
              </span>
              <span className="text-xs text-[#111111]/50 line-through">
                {format(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-[#111111]">
              {format(product.price)}
            </span>
          )}
          <span className="text-[10px] text-[#111111]/40">EGP</span>
        </div>
      </Link>
    </article>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  locale: string
  newLabel: string
  saleLabel: string
  isInWishlist?: (id: string) => boolean
  onToggleWishlist?: (id: string) => void
}

/**
 * Image-focused product card.
 *
 * - The primary image shows by default; a secondary image cross-fades in on
 *   hover so customers can preview the product naturally while browsing.
 * - There are no color selectors: every variant of a product shares the
 *   primary photography, and customers choose a size on the product page.
 * - Fixed aspect ratio prevents layout shift when the secondary loads.
 */
export function ProductCard({
  product,
  locale,
  newLabel,
  saleLabel,
  isInWishlist,
  onToggleWishlist,
}: ProductCardProps) {
  const images = product.images ?? []
  const primaryImage = images.find((i) => i.isPrimary) ?? images[0]
  const secondaryImage = images.length > 1 ? images[1] : null

  const wished = isInWishlist?.(product.id) ?? false
  const displayPrice = product.salePrice ?? product.price
  const isOnSale = Boolean(product.salePrice)

  return (
    <motion.article
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="group"
    >
      <Link
        href={`/product/${product.slug}`}
        aria-label={product.name}
        className="block"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-mist">
          {primaryImage ? (
            <Image
              fill
              src={primaryImage.cardUrl ?? primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw"
              priority={false}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-ink/40">
              {product.name}
            </div>
          )}

          {/* Secondary image cross-fades in on hover. */}
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

          {/* Badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-2">
            {product.newArrival && (
              <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm">
                {newLabel}
              </span>
            )}
            {isOnSale && (
              <span className="rounded-full border border-brand bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide text-brand shadow-sm">
                {saleLabel}
              </span>
            )}
          </div>

          {/* Wishlist */}
          {onToggleWishlist && (
            <button
              type="button"
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wished}
              onClick={(e) => {
                e.preventDefault()
                onToggleWishlist(product.id)
              }}
              className="absolute end-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-brand opacity-0 shadow-md backdrop-blur transition-all duration-300 hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
            >
              <svg
                className={`h-5 w-5 ${wished ? 'fill-brand text-brand' : 'text-ink/70'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.75a1.5 1.5 0 0 0-2.12 0l-7.5 7.5a1.5 1.5 0 0 0 0 2.12l4.5 4.5a1.5 1.5 0 0 0 2.12 0l8.5-8.5Z" />
              </svg>
            </button>
          )}
        </div>

        {/* Product information */}
        <div className="pt-3">
          <Link
            href={`/product/${product.slug}`}
            className="block"
          >
            <h3 className="line-clamp-1 text-sm font-bold leading-snug text-ink">
              {product.name}
            </h3>
          </Link>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-ink/50">
            {product.category.name}
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {formatPrice(displayPrice, locale)}
            {isOnSale && (
              <span className="ml-2 text-xs font-normal text-ink/50 line-through">
                {formatPrice(product.price, locale)}
              </span>
            )}
          </p>
        </div>
      </Link>
    </motion.article>
  )
}

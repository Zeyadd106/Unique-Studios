'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
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

// Minimal EasyOrders/Van-Graph style card: rounded image, name, price — no chrome.
export function ProductCard({
  product,
  locale,
  newLabel,
  saleLabel,
  isInWishlist,
  onToggleWishlist,
}: ProductCardProps) {
  const image = product.images[0]
  const wished = isInWishlist?.(product.id) ?? false

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-md bg-[#F3F3F3] aspect-[3/4]">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          {image ? (
            <img
              src={image.url}
              alt={image.alt || product.name}
              loading="lazy"
              className="vg-card-image h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              {product.name}
            </div>
          )}
        </Link>

        <div className="absolute top-2 start-2 flex flex-col gap-1.5">
          {product.newArrival && (
            <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-white">
              {newLabel}
            </span>
          )}
          {product.salePrice && (
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-black border border-[#E2E2E2]">
              {saleLabel}
            </span>
          )}
        </div>

        {onToggleWishlist && (
          <button
            type="button"
            aria-label="wishlist"
            onClick={() => onToggleWishlist(product.id)}
            className="absolute bottom-2 end-2 p-2 rounded-full bg-white shadow-md transition-opacity md:opacity-0 md:group-hover:opacity-100 hover:opacity-80"
          >
            <Heart className={`h-4 w-4 ${wished ? 'fill-black text-black' : ''}`} />
          </button>
        )}
      </div>

      <div className="pt-3 px-0.5">
        <Link href={`/product/${product.slug}`} className="hover:opacity-70 transition-opacity">
          <h3 className="text-sm font-semibold leading-snug line-clamp-1">{product.name}</h3>
        </Link>
        <p className="mt-0.5 text-xs text-[#131316]/60 line-clamp-1">{product.category.name}</p>
        <div className="mt-1 flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="text-sm font-bold">{formatPrice(product.salePrice, locale)}</span>
              <span className="text-xs text-[#131316]/50 line-through">
                {formatPrice(product.price, locale)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold">{formatPrice(product.price, locale)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

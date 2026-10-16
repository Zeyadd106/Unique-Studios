'use client'

import { useState } from 'react'
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
 * Premium product card with color swatch support.
 *
 * - Primary image shows by default; secondary image cross-fades on hover.
 * - Color swatches displayed below the image; clicking a swatch updates the
 *   card image without navigating away from the category page.
 * - Fixed aspect-ratio container prevents layout shift on hover.
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

  // Get unique colors from variants
  const colors = [...new Set(product.variants?.map((v) => v.color) ?? [])]
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  // Image to display: if a color is selected, find an image matching that color
  // Otherwise show primary
  const displayImage =
    selectedColor && images.length > 1
      ? images.find((i) => i.alt?.includes(selectedColor)) ?? primaryImage
      : primaryImage

  const wished = isInWishlist?.(product.id) ?? false
  const displayPrice = product.salePrice ?? product.price
  const isOnSale = Boolean(product.salePrice)

  // Color swatch color codes
  const colorCodes: Record<string, string> = {
    black: '#000000',
    white: '#ffffff',
    gray: '#808080',
    grey: '#808080',
    blue: '#0000ff',
    burgundy: '#800020',
    pink: '#ffc0cb',
    navy: '#000080',
    red: '#ff0000',
    green: '#008000',
    yellow: '#ffd700',
    purple: '#800080',
    orange: '#ffa500',
    beige: '#f5f5dc',
    brown: '#a52a2a',
    cream: '#fffdd0',
    nude: '#e6cfaa',
    gold: '#ffd700',
    silver: '#c0c0c0',
  }

  const getColorCode = (colorName: string) => {
    return colorCodes[colorName.toLowerCase()] || '#cccccc'
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-lg bg-[#F3F3F3] aspect-[2/3]">
        <Link
          href={`/product/${product.slug}`}
          aria-label={product.name}
          className="block h-full"
          onClick={(e) => {
            // Allow navigation on card click (not on swatches)
          }}
        >
          {displayImage ? (
            <Image
              fill
              src={displayImage.cardUrl ?? displayImage.url}
              alt={displayImage.alt || product.name}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out opacity-100"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-[#111111]/40">
              {product.name}
            </div>
          )}

          {/* New / Sale badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-2 z-10">
            {product.newArrival && (
              <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                {newLabel}
              </span>
            )}
            {isOnSale && (
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#111111] border border-[#E5E5E5] shadow-sm">
                {saleLabel}
              </span>
            )}
          </div>

          {/* Wishlist */}
          {onToggleWishlist && (
            <button
              type="button"
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={(e) => {
                e.preventDefault()
                onToggleWishlist(product.id)
              }}
              className="absolute bottom-3 end-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur shadow-md transition-opacity md:opacity-0 group-hover:opacity-100 hover:bg-white focus:outline-none"
            >
              <svg
                className={`h-4 w-4 ${wished ? 'fill-[#111111] text-[#111111]' : 'text-[#111111]/80'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 19l7-6 7 6" />
              </svg>
            </button>
          )}
        </Link>

        {/* Color swatches overlay - bottom of card */}
        {colors.length > 1 && (
          <div className="absolute bottom-2 left-4 right-2 flex gap-2 z-20">
            {colors.map((color) => {
              const isSelected = selectedColor === color
              const colorCode = getColorCode(color)
              const contrastColor = getContrastColor(colorCode)
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select ${color}`}
                  aria-pressed={isSelected}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setSelectedColor(isSelected ? null : color)
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex-shrink-0 ${
                    isSelected
                      ? 'border-[#111111] ring-1 ring-[#111111] scale-110'
                      : 'border-[#111111]/30 hover:border-[#111111]'
                  }`}
                  style={{
                    backgroundColor: colorCode,
                    color: contrastColor,
                  }}
                >
                  <span className="sr-only">{color}</span>
                  {isSelected && (
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Mobile hint */}
        {colors.length > 1 && (
          <div className="absolute bottom-0 start-0 end-0 h-6 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center pointer-events-none text-[10px] font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            Select color
          </div>
        )}
      </div>

      <div className="pt-3 px-0.5">
        <Link
          href={`/product/${product.slug}`}
          className="hover:opacity-70 transition-opacity"
          onClick={(e) => {
            // Navigation works normally
          }}
        >
          <h3 className="text-sm font-semibold leading-snug line-clamp-1">{product.name}</h3>
        </Link>
        <p className="mt-0.5 text-xs text-[#111111]/60 line-clamp-1">
          {product.category.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {isOnSale ? (
            <>
              <span className="text-sm font-bold">{formatPrice(product.salePrice ?? product.price, locale)}</span>
              <span className="text-xs text-[#111111]/50 line-through">
                {formatPrice(product.price, locale)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold">{formatPrice(displayPrice, locale)}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function getContrastColor(hex: string): string {
  // Simple luminance-based contrast
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

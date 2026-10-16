'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react'
import type { ProductImage } from '@/types'

interface ProductGalleryProps {
  images: ProductImage[]
  className?: string
}

/**
 * Image gallery for the product page.
 *
 * - The main image is the primary photograph; thumbnails switch between the
 *   remaining views. Arrows and zoom are available on larger screens.
 * - Images are lazy-loaded except for the first one.
 */
export function ProductGallery({ images, className }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const image = images[selectedIndex] ?? images[0]

  if (!image) {
    return (
      <div
        className={`flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-brand-mist text-sm text-ink/40 ${className ?? ''}`}
      >
        No image
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-mist">
        <Image
          fill
          src={image.url}
          alt={image.alt || 'Product'}
          sizes="(max-width: 768px) 100vw, 600px"
          priority
          className="object-cover"
        />

        {zoomed && (
          <button
            type="button"
            aria-label="Close zoom"
            onClick={() => setZoomed(false)}
            className="absolute end-3 top-3 z-50 rounded-full bg-white p-2.5 text-brand shadow-md transition-colors hover:bg-brand-mist"
          >
            <Minimize className="h-5 w-5" />
          </button>
        )}

        {!zoomed && images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() =>
                setSelectedIndex((i) => (i - 1 + images.length) % images.length)
              }
              className="absolute start-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/95 p-2.5 text-brand opacity-0 shadow-md backdrop-blur transition-all hover:bg-white group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setSelectedIndex((i) => (i + 1) % images.length)}
              className="absolute end-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/95 p-2.5 text-brand opacity-0 shadow-md backdrop-blur transition-all hover:bg-white group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Zoom image"
              onClick={() => setZoomed(true)}
              className="absolute end-3 bottom-3 z-30 rounded-full bg-white/95 p-2.5 text-brand shadow-md backdrop-blur transition-all hover:bg-white"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => {
            const active = index === selectedIndex
            return (
              <button
                key={img.id}
                type="button"
                aria-label={img.alt || `Image ${index + 1}`}
                aria-pressed={active}
                onClick={() => setSelectedIndex(index)}
                className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  active
                    ? 'border-brand scale-105'
                    : 'border-transparent hover:border-brand/50'
                }`}
              >
                <Image
                  fill
                  src={img.thumbUrl ?? img.url}
                  alt={img.alt || `Image ${index + 1}`}
                  sizes="96px"
                  loading="lazy"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}

      {zoomed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={() => setZoomed(false)}
        >
          <div className="relative aspect-[4/5] w-full max-w-3xl overflow-hidden rounded-2xl bg-white">
            <Image
              fill
              src={image.url}
              alt={image.alt || 'Product'}
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

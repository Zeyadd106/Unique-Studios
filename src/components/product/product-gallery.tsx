'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react'
import type { ProductImage } from '@/types'

interface ProductGalleryProps {
  images: ProductImage[]
  className?: string
}

export function ProductGallery({ images, className }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const image = images[selectedIndex]

  // On very small screens start with the first image (already default).
  useEffect(() => {
    if (images.length && selectedIndex >= images.length) {
      setSelectedIndex(0)
    }
  }, [images.length, selectedIndex])

  if (images.length === 0) {
    return (
      <div className={cn('aspect-[2/3] rounded-lg bg-[#F3F3F3] overflow-hidden', className)}>
        <div className="h-full w-full flex items-center justify-center text-[#111111]/40 text-sm">
          No image
        </div>
      </div>
    )
  }

  const mainImageProps = {
    fill: true,
    src: image.url,
    alt: image.alt || 'Product',
    sizes: '(max-width: 768px) 100vw, 720px',
    priority: selectedIndex === 0,
    className: 'absolute inset-0 h-full w-full object-cover',
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative aspect-[2/3] rounded-lg bg-[#F3F3F3] overflow-hidden"
      >
        <Image {...mainImageProps} />

        {zoomed && (
          <button
            type="button"
            aria-label="Exit zoom"
            onClick={() => setZoomed(false)}
            className="absolute top-3 end-3 z-50 p-2 rounded-full bg-white/90 backdrop-blur hover:bg-white"
          >
            <Minimize className="h-5 w-5" />
          </button>
        )}

        {!zoomed && images.length > 1 && (
          <>
            {/* Nav arrows on main image */}
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setSelectedIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute top-1/2 start-3 -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 backdrop-blur hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setSelectedIndex((i) => (i + 1) % images.length)}
              className="absolute top-1/2 end-3 -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 backdrop-blur hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Zoom button */}
            <button
              type="button"
              aria-label="Zoom image"
              onClick={() => setZoomed(true)}
              className="absolute bottom-3 end-3 z-30 p-2 rounded-full bg-white/90 backdrop-blur hover:bg-white"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </>
        )}
      </motion.div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => {
            const active = index === selectedIndex
            return (
              <button
                key={img.id}
                type="button"
                aria-label={img.alt || `Image ${index + 1}`}
                aria-pressed={active}
                onClick={() => setSelectedIndex(index)}
                className={`
                  flex-shrink-0 aspect-[2/3] rounded-lg border-2 overflow-hidden
                  ${active ? 'border-[#111111]' : 'border-transparent hover:border-[#111111]/50'}
                  transition-all duration-200
                `}
              >
                <Image
                  fill
                  src={img.thumbUrl ?? img.url}
                  alt={img.alt || `Image ${index + 1}`}
                  sizes="120px"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}

      {/* Zoom overlay */}
      {zoomed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setZoomed(false)}
        >
          <div className="relative w-full max-w-[1000px] max-h-[calc(100vh-2rem)] aspect-[2/3] overflow-hidden rounded-lg bg-white">
            <Image
              fill
              src={image.url}
              alt={image.alt || 'Product'}
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-contain object-center bg-white"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

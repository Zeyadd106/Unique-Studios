'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { motion } from 'framer-motion'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  _count: { products: number }
}

export default function CategoriesPage() {
  const { locale, setLocale, direction } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      <main className="flex-1">
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block mb-4 px-4 py-1 rounded-full bg-[#F3F3F3] text-[#111111] text-[11px] font-bold uppercase tracking-widest"
              >
                Explore
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight"
              >
                {t('nav.categories')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-[#111111]/60 max-w-2xl mx-auto leading-relaxed"
              >
                Discover our collections. Each piece is crafted with attention
                to detail and made for those who dare to stand out.
              </motion.p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#F3F3F3] aspect-[4/5] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#111111]/60">No categories available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {categories.map((category) => {
                  const cover = category.image
                  return (
                    <motion.div
                      whileHover={{ y: -8 }}
                      key={category.id}
                      className="group cursor-pointer"
                    >
                      <Link
                        href={`/shop?category=${category.slug}`}
                        className="block"
                        onClick={(e) => {
                          // Let Next.js handle navigation
                        }}
                      >
                        <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-[#F3F3F3]">
                          {cover ? (
                            <Image
                              fill
                              src={cover}
                              alt={category.name}
                              sizes="(max-width: 768px) 100vw, 400px"
                              priority={false}
                              loading="lazy"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#111111]/20 text-3xl font-bold">
                              {category.name.charAt(0)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
                          <div className="absolute bottom-0 start-0 end-0 p-6 md:p-8">
                            <h3 className="text-xl md:text-2xl font-bold text-white">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-sm text-white/90 mt-2">
                                {category.description}
                              </p>
                            )}
                            <p className="text-xs text-white/70 mt-3 uppercase tracking-wider">
                              {category._count.products} piece{category._count.products !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="absolute top-4 end-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#111111] hover:bg-white transition-all shadow-sm">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="2.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { Sparkles, Heart, Target, Award, Users, ShoppingBag, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  const values = [
    { key: 'about.ourStory', title: t('about.ourStory'), icon: Heart },
    { key: 'about.ourVision', title: t('about.ourVision'), icon: Target },
    { key: 'about.ourStyle', title: t('about.ourStyle'), icon: Sparkles },
    { key: 'about.quality', title: t('about.quality'), icon: Award },
    { key: 'about.community', title: t('about.community'), icon: Users },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-brand-mist/20 to-white">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      <main className="flex-1 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="pointer-events-none absolute top-20 right-10 h-72 w-72 rounded-full bg-brand/5 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-20 left-10 h-96 w-96 rounded-full bg-brand/5 blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <section className="relative py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12 md:mb-16 max-w-4xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 flex items-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-4 w-4 text-brand" />
                </motion.div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/50">
                  {t('about.title').toUpperCase()}
                </p>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl"
              >
                {t('about.title')}
              </motion.h1>
            </motion.div>

            <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
              <div className="space-y-12">
                {values.map((value, index) => (
                  <motion.section
                    key={value.key}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="group relative overflow-hidden rounded-2xl border-2 border-brand/10 bg-white/80 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-brand/20 hover:border-brand/20"
                  >
                    <motion.div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent opacity-0 transition-opacity duration-300"
                      whileHover={{ opacity: 1 }}
                    />
                    <div className="relative">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: index * 0.1 + 0.1 }}
                        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand/60 shadow-lg shadow-brand/30"
                      >
                        <value.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <h2 className="text-2xl font-bold tracking-tight text-ink transition-colors group-hover:text-brand">
                        {value.title}
                      </h2>
                      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/75 md:text-base">
                        <p>
                          {
                            {
                              'about.ourStory':
                                'We were founded with a simple vision: to create streetwear that breaks boundaries and empowers individuality. We believe that fashion should be a form of self-expression — bold, authentic, and unapologetically unique.',
                              'about.ourVision':
                                'We envision a world where everyone feels confident expressing their unique style through fashion. Our goal is to become the go-to destination for premium streetwear enthusiasts who value quality, authenticity, and individuality.',
                              'about.ourStyle':
                                'Our style is defined by oversized silhouettes, clean lines, and premium materials. We draw inspiration from street culture, modern art, and urban landscapes to create pieces that are both timeless and contemporary.',
                              'about.quality':
                                'Quality is at the heart of everything we do. We source the finest materials, work with skilled craftsmen, and implement rigorous quality control measures to ensure that every piece meets our exacting standards.',
                              'about.community':
                                'We are more than just a clothing brand — we are a community of like-minded individuals who share a passion for authentic self-expression. Our customers are our inspiration, and we are committed to building a brand that resonates with people who dare to be different.',
                            }[value.key] ?? ''
                          }
                        </p>
                      </div>
                    </div>
                  </motion.section>
                ))}
              </div>

              {/* Sidebar */}
              <aside className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6 }}
                  className="relative overflow-hidden rounded-2xl border-2 border-brand/10 bg-white/80 backdrop-blur-xl p-6 shadow-2xl shadow-brand/5 transition-all duration-300 hover:shadow-brand/10 hover:border-brand/20"
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="relative">
                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-ink">
                      <Heart className="h-4 w-4 text-brand" />
                      {t('about.title')}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-ink/75">
                      {t('home.ourStoryText')}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-ink/75">
                      {t('home.joinMovement')}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative overflow-hidden rounded-2xl border-2 border-brand/10 bg-white/80 backdrop-blur-xl p-6 shadow-2xl shadow-brand/5 transition-all duration-300 hover:shadow-brand/10 hover:border-brand/20"
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="relative">
                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-ink">
                      <ShoppingBag className="h-4 w-4 text-brand" />
                      {t('common.shopNow')}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-ink/75">
                      {t('home.shopByCategorySubtitle')}
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/shop"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand/90 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand/30 transition-all duration-300 hover:shadow-brand/50 hover:scale-105"
                      >
                        {t('common.shopAll')}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { ChevronDown } from 'lucide-react'

export default function FaqPage() {
  const { locale, setLocale } = useLocale()
  const { t, tList } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const questions = tList('faq.questions')
  const answers = tList('faq.answers')

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-12 max-w-3xl text-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-ink/50">
                {t('faq.title').toUpperCase()}
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
                {t('faq.title')}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-ink/60 md:text-base">
                {t('faq.subtitle')}
              </p>
            </div>

            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-brand-line bg-white shadow-[0_18px_40px_-24px_rgb(0_0_0_0.18)]">
                {questions.map((question, index) => {
                  const open = openIndex === index
                  return (
                    <motion.div
                      key={index}
                      initial={false}
                      animate={{ opacity: open ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-b border-brand-line last:border-b-0"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenIndex(open ? null : index)}
                        className="flex w-full items-center justify-between gap-4 py-5 text-start"
                      >
                        <span className="text-sm font-bold text-ink md:text-base">
                          {question}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-brand transition-transform ${
                            open ? 'rotate-180' : ''
                          }`}
                          aria-hidden
                        />
                      </button>
                      {open && (
                        <p className="pb-6 text-sm leading-relaxed text-ink/75">
                          {answers[index] ?? ''}
                        </p>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

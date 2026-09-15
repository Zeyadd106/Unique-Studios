'use client'

import { useState } from 'react'
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
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <h1 className="text-2xl md:text-3xl font-extrabold text-center">{t('faq.title')}</h1>
          <p className="mt-3 text-sm md:text-base text-center text-[#131316]/70">
            {t('faq.subtitle')}
          </p>

          <div className="mt-8 border-t border-[#E2E2E2]">
            {questions.map((q, i) => {
              const open = openIndex === i
              return (
                <div key={i} className="border-b border-[#E2E2E2]">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-start"
                  >
                    <span className="text-sm md:text-base font-bold">{q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && (
                    <p className="pb-5 text-sm text-[#131316]/70 leading-relaxed">
                      {answers[i] ?? ''}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

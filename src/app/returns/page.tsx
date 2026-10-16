'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'

export default function ReturnsPage() {
  const { locale, setLocale } = useLocale()
  const { t, tList } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  const conditions = tList('returns.conditions')
  const steps = tList('returns.steps')

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
            <div className="mb-10 max-w-3xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-ink/50">
                {t('returns.title').toUpperCase()}
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
                {t('returns.title')}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-ink/60 md:text-base">
                {t('returns.intro')}
              </p>
            </div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-brand-line bg-white p-6 shadow-[0_18px_40px_-24px_rgb(0_0_0_0.18)] md:p-8"
              >
                <h2 className="text-lg font-bold text-ink">
                  {t('returns.windowTitle')}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink/75">
                  {t('returns.windowText')}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="rounded-2xl border border-brand-line bg-white p-6 shadow-[0_18px_40px_-24px_rgb(0_0_0_0.18)] md:p-8"
              >
                <h2 className="text-lg font-bold text-ink">
                  {t('returns.conditionsTitle')}
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-ink/75">
                  {conditions.map((condition, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="font-bold text-brand">•</span>
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-brand-line bg-white p-6 shadow-[0_18px_40px_-24px_rgb(0_0_0_0.18)] md:p-8"
              >
                <h2 className="text-lg font-bold text-ink">
                  {t('returns.howTitle')}
                </h2>
                <ol className="mt-4 space-y-3">
                  {steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm text-ink/75">{step}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="rounded-2xl border border-brand-line bg-white p-6 shadow-[0_18px_40px_-24px_rgb(0_0_0_0.18)] md:p-8"
              >
                <h2 className="text-lg font-bold text-ink">
                  {t('returns.shippingTitle')}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink/75">
                  {t('returns.shippingText')}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl border border-brand-line bg-white p-6 shadow-[0_18px_40px_-24px_rgb(0_0_0_0.18)] md:p-8"
              >
                <h2 className="text-lg font-bold text-ink">
                  {t('returns.defectiveTitle')}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink/75">
                  {t('returns.defectiveText')}
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

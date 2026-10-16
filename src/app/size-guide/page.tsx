'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'

interface SizeChart {
  name: string
  note: string
  headers: string[]
  rows: string[][]
}

const CHARTS: SizeChart[] = [
  {
    name: 'Off Shoulder',
    note: 'Measured flat: length × width',
    headers: ['Size', 'Length (cm)', 'Width (cm)'],
    rows: [
      ['S', '56 cm', '58 cm'],
      ['M', '58 cm', '60 cm'],
      ['L', '60 cm', '62 cm'],
    ],
  },
  {
    name: 'Sweatpants',
    note: 'Measured flat: hip × length',
    headers: ['Size', 'Hip (cm)', 'Length (cm)'],
    rows: [
      ['M', '53 cm', '107 cm'],
      ['L', '56 cm', '110 cm'],
      ['XL', '60 cm', '113 cm'],
    ],
  },
  {
    name: 'Crewneck',
    note: 'Measured flat: length × width',
    headers: ['Size', 'Length (cm)', 'Width (cm)'],
    rows: [
      ['M', '67 cm', '63 cm'],
      ['L', '70 cm', '66 cm'],
      ['XL', '73 cm', '69 cm'],
    ],
  },
]

export default function SizeGuidePage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

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
            <div className="mb-12 max-w-4xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-ink/50">
                {t('sizeGuide.title').toUpperCase()}
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
                {t('sizeGuide.title')}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-ink/60 md:text-base">
                Off Shoulder · Sweatpants · Crewneck — all measurements in cm,
                measured flat
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {CHARTS.map((chart, index) => (
                <motion.div
                  key={chart.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="overflow-hidden rounded-2xl border border-brand-line bg-white shadow-[0_18px_40px_-24px_rgb(0_0_0_0.18)]"
                >
                  <div className="border-b border-brand-line bg-brand-mist/60 px-6 py-4">
                    <h2 className="text-xl font-bold text-ink">{chart.name}</h2>
                    <p className="mt-1 text-xs text-ink/60">{chart.note}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-start">
                      <thead className="bg-white">
                        <tr>
                          {chart.headers.map((header) => (
                            <th
                              key={header}
                              scope="col"
                              className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink/70"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chart.rows.map((row) => (
                          <tr key={row[0]} className="border-t border-brand-line">
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className={`px-6 py-4 ${
                                  cellIndex === 0
                                    ? 'font-bold text-ink'
                                    : 'text-ink/75'
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-brand-line bg-white p-6 shadow-[0_18px_40px_-24px_rgb(0_0_0_0.18)] md:p-8"
              >
                <h2 className="text-lg font-bold text-ink">
                  {t('sizeGuide.howToMeasure')}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/75">
                  <div>
                    <h3 className="font-semibold text-ink">
                      {t('sizeGuide.chest')}: </h3>
                    <p>{t('sizeGuide.chestText')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">
                      {t('sizeGuide.length')}:{' '}
                    </h3>
                    <p>{t('sizeGuide.lengthText')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">
                      {t('sizeGuide.waist')}:{' '}
                    </h3>
                    <p>{t('sizeGuide.waistText')}</p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="rounded-2xl border border-brand-line bg-white p-6 shadow-[0_18px_40px_-24px_rgb(0_0_0_0.18)] md:p-8"
              >
                <h2 className="text-lg font-bold text-ink">
                  {t('sizeGuide.fitGuide')}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/75">
                  <div>
                    <h3 className="font-semibold text-ink">
                      {t('sizeGuide.oversizedTitle')}:{' '}
                    </h3>
                    <p>{t('sizeGuide.oversizedText')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">
                      {t('sizeGuide.regularTitle')}:{' '}
                    </h3>
                    <p>{t('sizeGuide.regularText')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">
                      {t('sizeGuide.widelegTitle')}:{' '}
                    </h3>
                    <p>{t('sizeGuide.widelegText')}</p>
                  </div>
                </div>
              </motion.section>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-brand-line bg-white p-6 shadow-[0_18px_40px_-24px_rgb(0_0_0_0.18)] md:p-8"
              >
                <p className="text-sm leading-relaxed text-ink/75">
                  <span className="font-semibold text-ink">
                    {t('sizeGuide.note')}
                  </span>{' '}
                  Measurements are approximate and may vary depending on the
                  product.
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

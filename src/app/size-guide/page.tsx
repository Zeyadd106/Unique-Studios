'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'

export default function SizeGuidePage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  const charts = [
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        locale={locale} 
        setLocale={setLocale} 
        cartCount={cartCount} 
        wishlistCount={wishlistCount}
        t={t}
      />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center text-[#111111]">{t('sizeGuide.title')}</h1>
            <p className="text-center text-sm text-[#111111]/60 mb-8">Off Shoulder · Sweatpants · Crewneck — all measurements in cm, measured flat</p>

            <div className="space-y-8">
              {charts.map((chart) => (
                <div key={chart.name} className="bg-white rounded-lg border-2 border-[#E5E5E5] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#F5F5F5]">
                    <h2 className="text-xl font-bold text-[#111111]">{chart.name}</h2>
                    <p className="text-xs text-[#111111]/60 mt-0.5">{chart.note}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {chart.headers.map((h) => (
                            <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chart.rows.map((row) => (
                          <tr key={row[0]} className="border-t border-gray-200">
                            {row.map((cell, i) => (
                              <td key={i} className={`px-6 py-4 ${i === 0 ? 'font-semibold' : ''}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">⚠️ {t('sizeGuide.note')}</p>
            </div>

            <div className="mt-8 space-y-6">
              <section>
                <h2 className="text-2xl font-bold mb-4">{t('sizeGuide.howToMeasure')}</h2>
                <div className="space-y-4 text-gray-600">
                  <div>
                    <h3 className="font-semibold mb-2">{t('sizeGuide.chest')}</h3>
                    <p>{t('sizeGuide.chestText')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('sizeGuide.length')}</h3>
                    <p>{t('sizeGuide.lengthText')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('sizeGuide.waist')}</h3>
                    <p>{t('sizeGuide.waistText')}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">{t('sizeGuide.fitGuide')}</h2>
                <div className="space-y-4 text-gray-600">
                  <div>
                    <h3 className="font-semibold mb-2">{t('sizeGuide.oversizedTitle')}</h3>
                    <p>{t('sizeGuide.oversizedText')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('sizeGuide.regularTitle')}</h3>
                    <p>{t('sizeGuide.regularText')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('sizeGuide.widelegTitle')}</h3>
                    <p>{t('sizeGuide.widelegText')}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}
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

  const sizeData = [
    { size: 'S', weight: '45-60 kg', chest: '92-96 cm', length: '68-70 cm', waist: '76-80 cm' },
    { size: 'M', weight: '55-70 kg', chest: '96-100 cm', length: '70-72 cm', waist: '80-84 cm' },
    { size: 'L', weight: '70-85 kg', chest: '100-104 cm', length: '72-74 cm', waist: '84-88 cm' },
    { size: 'XL', weight: '85-100 kg', chest: '104-108 cm', length: '74-76 cm', waist: '88-92 cm' },
    { size: 'XXL', weight: '100-120 kg', chest: '108-112 cm', length: '76-78 cm', waist: '92-96 cm' },
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
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">{t('sizeGuide.title')}</h1>
            
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">{t('sizeGuide.size')}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t('sizeGuide.weight')}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t('sizeGuide.chest')}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t('sizeGuide.length')}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t('sizeGuide.waist')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeData.map((row) => (
                      <tr key={row.size} className="border-t border-gray-200">
                        <td className="px-6 py-4 font-semibold">{row.size}</td>
                        <td className="px-6 py-4">{row.weight}</td>
                        <td className="px-6 py-4">{row.chest}</td>
                        <td className="px-6 py-4">{row.length}</td>
                        <td className="px-6 py-4">{row.waist}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
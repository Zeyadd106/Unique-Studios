'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-center">{t('returns.title')}</h1>
          <p className="mt-3 text-sm md:text-base text-center text-[#131316]/70">
            {t('returns.intro')}
          </p>

          <div className="mt-8 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-bold mb-2">{t('returns.windowTitle')}</h2>
                <p className="text-sm text-[#131316]/70">{t('returns.windowText')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="font-bold mb-3">{t('returns.conditionsTitle')}</h2>
                <ul className="space-y-2 text-sm text-[#131316]/70">
                  {conditions.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="font-bold mb-3">{t('returns.howTitle')}</h2>
                <ol className="space-y-3 text-sm text-[#131316]/70">
                  {steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="font-bold mb-2">{t('returns.shippingTitle')}</h2>
                <p className="text-sm text-[#131316]/70">{t('returns.shippingText')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="font-bold mb-2">{t('returns.defectiveTitle')}</h2>
                <p className="text-sm text-[#131316]/70">{t('returns.defectiveText')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { CheckCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationLoading />}>
      <ConfirmationContent />
    </Suspense>
  )
}

function ConfirmationLoading() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <p className="text-gray-600">Loading...</p>
    </div>
  )
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  
  const orderNumber = searchParams.get('orderNumber')

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        locale={locale} 
        setLocale={setLocale} 
        cartCount={0} 
        wishlistCount={0}
        t={t}
      />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <CheckCircle className="h-20 w-20 mx-auto text-green-600" />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-green-600">
                  {t('confirmation.title')}
                </h1>
                
                <p className="text-lg text-gray-600 mb-6">
                  {t('confirmation.message')}
                </p>
                
                {orderNumber && (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-6">
                    <p className="text-gray-600 mb-2">{t('confirmation.orderNumber')}</p>
                    <p className="text-2xl font-bold">{orderNumber}</p>
                  </div>
                )}
                
                <p className="text-gray-600 mb-8">
                  {t('confirmation.followUp')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {orderNumber && (
                    <Link
                      href={`/track?orderNumber=${encodeURIComponent(orderNumber)}`}
                    >
                      <Button size="lg" variant="outline">
                        {t('footer.trackOrder')}
                      </Button>
                    </Link>
                  )}
                  <Link href="/shop">
                    <Button size="lg">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      {t('confirmation.continueShopping')}
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button size="lg" variant="outline">
                      {t('nav.home')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}
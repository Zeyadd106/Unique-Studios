'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { PackageSearch, Check } from 'lucide-react'

interface TrackedItem {
  productName: string
  size: string
  color: string
  quantity: number
}

interface TrackedOrder {
  orderNumber: string
  status: string
  items: TrackedItem[]
  total: number
  city: string
  paymentMethod: string
  createdAt: string
}

const TIMELINE = ['NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const

export default function TrackPage() {
  return (
    <Suspense fallback={<TrackLoading />}>
      <TrackContent />
    </Suspense>
  )
}

function TrackLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">...</p>
    </div>
  )
}

function TrackContent() {
  const searchParams = useSearchParams()
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') ?? '')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const statusLabel = (status: string): string => {
    switch (status) {
      case 'NEW':
        return t('order.statusNew')
      case 'CONFIRMED':
        return t('order.statusConfirmed')
      case 'PROCESSING':
        return t('order.statusProcessing')
      case 'SHIPPED':
        return t('order.statusShipped')
      case 'DELIVERED':
        return t('order.statusDelivered')
      case 'CANCELLED':
        return t('order.statusCancelled')
      default:
        return status
    }
  }

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOrder(null)
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        phone: phone.trim(),
      })
      const response = await fetch(`/api/track?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('track.notFound'))
      setOrder(data)
    } catch {
      setError(t('track.notFound'))
    } finally {
      setIsLoading(false)
    }
  }

  const currentStep = order ? TIMELINE.indexOf(order.status as (typeof TIMELINE)[number]) : -1

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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="text-center mb-8">
            <PackageSearch className="h-12 w-12 mx-auto mb-4 text-black" />
            <h1 className="text-2xl md:text-3xl font-extrabold">{t('track.title')}</h1>
            <p className="mt-2 text-sm text-[#131316]/70">{t('track.subtitle')}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleTrack} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="orderNumber">{t('track.orderNumber')}</Label>
                  <Input
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder={t('track.orderNumberPlaceholder')}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t('track.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" loading={isLoading}>
                  {t('track.trackButton')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {order && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{order.orderNumber}</span>
                  <span className="text-sm font-bold">{statusLabel(order.status)}</span>
                </CardTitle>
                <p className="text-xs text-[#131316]/60">
                  {t('track.orderDate')}: {new Date(order.createdAt).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                {/* Timeline */}
                {order.status === 'CANCELLED' ? (
                  <p className="text-sm font-bold text-red-600">
                    {statusLabel(order.status)}
                  </p>
                ) : (
                  <ol className="flex items-center gap-1 mb-6">
                    {TIMELINE.map((step, i) => {
                      const done = i <= currentStep
                      return (
                        <li key={step} className="flex-1">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              done ? 'bg-black text-white' : 'bg-[#F1F1F1] text-[#131316]/40'
                            }`}
                          >
                            {done ? <Check className="h-4 w-4" /> : i + 1}
                          </div>
                          <p
                            className={`mt-1 text-[10px] md:text-[11px] font-semibold leading-tight ${
                              done ? '' : 'text-[#131316]/40'
                            }`}
                          >
                            {statusLabel(step)}
                          </p>
                          {i < TIMELINE.length - 1 && (
                            <div className={`mt-1 h-0.5 ${i < currentStep ? 'bg-black' : 'bg-[#E2E2E2]'}`} />
                          )}
                        </li>
                      )
                    })}
                  </ol>
                )}

                <div className="border-t border-[#E2E2E2] pt-4">
                  <p className="text-sm font-bold mb-2">{t('track.items')}</p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>
                          {item.productName} — {item.size} / {item.color} × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 pt-3 border-t border-[#E2E2E2]">
                    <span className="font-bold">{t('track.total')}</span>
                    <span className="font-extrabold">EGP {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

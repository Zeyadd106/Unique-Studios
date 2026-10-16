'use client'

import { Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Check, Package, Truck, Clock, MapPin, CreditCard, Sparkles } from 'lucide-react'

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
  subtotal: number
  voucherCode: string | null
  discountAmount: number
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
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <motion.div
          className="h-12 w-12 rounded-full bg-gradient-to-br from-brand to-brand/60"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 h-12 w-12 rounded-full bg-gradient-to-br from-brand to-brand/60 blur-xl"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  )
}

function TrackContent() {
  const searchParams = useSearchParams()
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  const [orderNumber, setOrderNumber] = useState(
    () => searchParams.get('orderNumber') ?? '',
  )
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

  const handleTrack = async (event: React.FormEvent) => {
    event.preventDefault()
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

  const currentStep = order
    ? TIMELINE.indexOf(order.status as (typeof TIMELINE)[number])
    : -1

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
          className="pointer-events-none absolute top-20 left-10 h-64 w-64 rounded-full bg-brand/5 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-20 right-10 h-96 w-96 rounded-full bg-brand/5 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
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
              className="mb-12 max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-brand" />
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/50">
                  {t('track.title').toUpperCase()}
                </p>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl"
              >
                {t('track.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-sm leading-relaxed text-ink/60 md:text-base"
              >
                {t('track.subtitle')}
              </motion.p>
            </motion.div>

            <div className="grid gap-10 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden border-2 border-brand/10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-brand/5 transition-all duration-300 hover:shadow-brand/10 hover:border-brand/20">
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
                  <CardContent className="relative pt-6">
                    <form onSubmit={handleTrack} className="space-y-5">
                      <AnimatePresence mode="wait">
                        {error && (
                          <motion.div
                            role="alert"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-lg"
                          >
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Label htmlFor="orderNumber" className="mb-2 text-sm font-semibold text-ink">
                          {t('track.orderNumber')}
                        </Label>
                        <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                          <Input
                            id="orderNumber"
                            value={orderNumber}
                            onChange={(event) =>
                              setOrderNumber(event.target.value)
                            }
                            placeholder={t('track.orderNumberPlaceholder')}
                            required
                            className="border-2 border-brand/20 bg-white/50 text-ink transition-all duration-300 focus:border-brand focus:bg-white focus:shadow-lg focus:shadow-brand/20"
                          />
                        </motion.div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Label htmlFor="phone" className="mb-2 text-sm font-semibold text-ink">
                          {t('track.phone')}
                        </Label>
                        <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            required
                            className="border-2 border-brand/20 bg-white/50 text-ink transition-all duration-300 focus:border-brand focus:bg-white focus:shadow-lg focus:shadow-brand/20"
                          />
                        </motion.div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            size="lg"
                            className="relative w-full overflow-hidden bg-gradient-to-r from-brand to-brand/90 text-white shadow-xl shadow-brand/30 transition-all duration-300 hover:shadow-brand/50"
                            disabled={isLoading}
                          >
                            <motion.div
                              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{
                                x: ['-100%', '100%'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                            {isLoading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Check className="h-5 w-5" />
                              </motion.div>
                            ) : (
                              <span className="relative flex items-center gap-2 font-semibold">
                                <Truck className="h-5 w-5" />
                                {t('track.trackButton')}
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <AnimatePresence mode="wait">
                {order && (
                  <motion.div
                    initial={{ opacity: 0, x: 30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 30, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card className="relative overflow-hidden border-2 border-brand/20 bg-white/90 backdrop-blur-xl shadow-2xl shadow-brand/10">
                        <motion.div
                          className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-brand/10 to-transparent blur-2xl"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <CardHeader className="relative">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <CardTitle className="flex flex-wrap items-baseline justify-between gap-3">
                              <motion.span
                                className="flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                              >
                                <Package className="h-5 w-5 text-brand" />
                                {order.orderNumber}
                              </motion.span>
                              <motion.span
                                className="rounded-full bg-gradient-to-r from-brand to-brand/80 px-3 py-1 text-sm font-bold text-white shadow-lg shadow-brand/30"
                                animate={{
                                  scale: [1, 1.05, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              >
                                {statusLabel(order.status)}
                              </motion.span>
                            </CardTitle>
                            <motion.p
                              className="mt-2 flex items-center gap-2 text-xs text-ink/50"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Clock className="h-3 w-3" />
                              {t('track.orderDate')}: {new Date(order.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-EG')}
                            </motion.p>
                          </motion.div>
                        </CardHeader>
                        <CardContent className="relative">
                          {order.status === 'CANCELLED' ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-center"
                            >
                              <p className="text-sm font-bold text-red-600">
                                {statusLabel(order.status)}
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <ol className="relative flex items-start gap-2 overflow-x-auto pb-4">
                                {TIMELINE.map((step, index) => {
                                  const done = index <= currentStep
                                  const current = index === currentStep
                                  return (
                                    <motion.li
                                      key={step}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.4 + index * 0.1 }}
                                      className="flex-1 min-w-[60px]"
                                    >
                                      <motion.div
                                        className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-lg transition-all duration-300 ${
                                          done
                                            ? 'bg-gradient-to-br from-brand to-brand/80 text-white shadow-brand/30'
                                            : current
                                            ? 'bg-gradient-to-br from-brand/40 to-brand/20 text-brand ring-4 ring-brand/20'
                                            : 'bg-brand-mist text-ink/30'
                                        }`}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        {done ? (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                          >
                                            <Check className="h-5 w-5" />
                                          </motion.div>
                                        ) : (
                                          index + 1
                                        )}
                                        {current && (
                                          <motion.div
                                            className="pointer-events-none absolute inset-0 rounded-full bg-brand/30 blur-xl"
                                            animate={{
                                              scale: [1, 1.5, 1],
                                              opacity: [0.5, 0.8, 0.5],
                                            }}
                                            transition={{
                                              duration: 2,
                                              repeat: Infinity,
                                              ease: "easeInOut",
                                            }}
                                          />
                                        )}
                                      </motion.div>
                                      <motion.p
                                        className={`mt-2 text-center text-[10px] font-semibold leading-tight md:text-[11px] ${
                                          done ? 'text-ink' : current ? 'text-brand font-bold' : 'text-ink/40'
                                        }`}
                                        animate={current ? {
                                          scale: [1, 1.05, 1],
                                        } : {}}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          ease: "easeInOut",
                                        }}
                                      >
                                        {statusLabel(step)}
                                      </motion.p>
                                      {index < TIMELINE.length - 1 && (
                                        <motion.div
                                          className={`absolute top-5 left-1/2 h-0.5 w-full -translate-y-1/2 rounded-full ${
                                            index < currentStep
                                              ? 'bg-gradient-to-r from-brand to-brand/60'
                                              : 'bg-brand-line'
                                          }`}
                                          initial={{ scaleX: 0 }}
                                          animate={{ scaleX: done ? 1 : 0 }}
                                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                        />
                                      )}
                                    </motion.li>
                                  )
                                })}
                              </ol>
                            </motion.div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6 border-t-2 border-brand/10 pt-6"
                          >
                            <motion.p
                              className="mb-4 flex items-center gap-2 text-sm font-bold text-ink"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.9 }}
                            >
                              <Package className="h-4 w-4 text-brand" />
                              {t('track.items')}
                            </motion.p>
                            <motion.div
                              className="space-y-3"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1 }}
                            >
                              {order.items.map((item, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 1.1 + index * 0.1 }}
                                  whileHover={{ x: 5 }}
                                  className="group flex justify-between gap-4 rounded-lg bg-brand-mist/30 p-3 text-sm transition-all duration-300 hover:bg-brand-mist/50"
                                >
                                  <span className="text-ink/75 transition-colors group-hover:text-ink">
                                    {item.productName} — {item.size} / {item.color}{' '}
                                    × {item.quantity}
                                  </span>
                                  <motion.div
                                    className="h-2 w-2 rounded-full bg-brand/50"
                                    animate={{
                                      scale: [1, 1.2, 1],
                                      opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1.4 }}
                              className="mt-6 flex justify-between border-t-2 border-brand/10 pt-4 text-lg"
                            >
                              <span className="font-bold text-ink">{t('track.total')}</span>
                              <motion.span
                                className="font-extrabold bg-gradient-to-r from-brand to-brand/80 bg-clip-text text-transparent"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              >
                                {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                                  style: 'currency',
                                  currency: 'EGP',
                                  maximumFractionDigits: 0,
                                }).format(order.total)}
                              </motion.span>
                            </motion.div>
                            {order.discountAmount > 0 && (
                              <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5 }}
                                className="mt-2 flex items-center gap-2 text-xs font-semibold text-brand"
                              >
                                <Sparkles className="h-3 w-3" />
                                {t('voucher.discount')}: −
                                {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                                  style: 'currency',
                                  currency: 'EGP',
                                  maximumFractionDigits: 0,
                                }).format(order.discountAmount)}
                                {order.voucherCode ? ` (${order.voucherCode})` : ''}
                              </motion.p>
                            )}
                          </motion.div>

                          {/* Order Details Footer */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6 }}
                            className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-gradient-to-br from-brand/5 to-brand/10 p-4"
                          >
                            <motion.div
                              className="flex items-center gap-2 text-xs text-ink/60"
                              whileHover={{ scale: 1.02 }}
                            >
                              <MapPin className="h-4 w-4 text-brand" />
                              <span>{order.city}</span>
                            </motion.div>
                            <motion.div
                              className="flex items-center gap-2 text-xs text-ink/60"
                              whileHover={{ scale: 1.02 }}
                            >
                              <CreditCard className="h-4 w-4 text-brand" />
                              <span>{order.paymentMethod}</span>
                            </motion.div>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

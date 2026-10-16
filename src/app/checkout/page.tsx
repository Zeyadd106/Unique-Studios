'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations'
import {
  ArrowRight,
  Banknote,
  Check,
  Loader2,
  Lock,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  User,
  X,
} from 'lucide-react'

/* ---------------------------------------------------------------------------
 * Checkout — conversion-tuned flow:
 * animated steps → numbered form sections with glowing inputs →
 * dark sticky summary with voucher states → success celebration overlay.
 * ------------------------------------------------------------------------- */

export default function CheckoutPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cart, cartTotal, cartCount, clearCart } = useCart()
  const { wishlistCount } = useWishlist()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [voucherInput, setVoucherInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string
    discount: number
  } | null>(null)
  const [voucherError, setVoucherError] = useState('')
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<string | null>(null)

  // A voucher discount depends on the subtotal — clear it when the cart changes.
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedVoucher(null)
      setVoucherError('')
    }, 0)
    return () => clearTimeout(timer)
  }, [cartTotal])

  const discount = appliedVoucher?.discount ?? 0
  const orderTotal = Math.max(0, cartTotal - discount)

  const formatEGP = (amount: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(amount)

  const applyVoucher = async () => {
    const code = voucherInput.trim()
    if (!code || cartTotal <= 0) return
    setIsApplyingVoucher(true)
    setVoucherError('')
    try {
      const response = await fetch(
        `/api/vouchers?code=${encodeURIComponent(code)}&subtotal=${cartTotal}`
      )
      const data = await response.json()
      if (!data.ok) {
        if (data.error === 'MIN_SUBTOTAL') {
          setVoucherError(
            `${t('voucher.minSubtotal')}: ${formatEGP(data.minSubtotal ?? 0)}`
          )
        } else {
          setVoucherError(t('voucher.invalid'))
        }
        setAppliedVoucher(null)
        return
      }
      setAppliedVoucher({ code: data.code, discount: data.discount })
      setVoucherInput('')
    } catch {
      setVoucherError(t('voucher.invalid'))
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = async (data: CheckoutFormData) => {
    if (cart.length === 0) {
      setError(t('cart.emptyMessage'))
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          voucherCode: appliedVoucher?.code,
          items: cart,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const order = await response.json()

      // Celebrate, then clear and go to confirmation.
      setPlacedOrder(order.orderNumber as string)
      const timer = setTimeout(() => {
        clearCart()
        router.push(`/confirmation?orderNumber=${order.orderNumber}`)
      }, 1600)
      return () => clearTimeout(timer)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.checkoutError'))
      setIsSubmitting(false)
    }
  }

  const steps = [
    { icon: ShoppingBag, label: t('nav.cart'), state: 'done' as const, href: '/cart' },
    { icon: Lock, label: t('checkout.title'), state: 'active' as const, href: null },
    { icon: Check, label: locale === 'ar' ? 'تم' : 'Done', state: 'todo' as const, href: null },
  ]

  if (cart.length === 0 && !placedOrder) {
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
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="mx-auto max-w-md rounded-[2rem] border border-brand-line bg-white px-6 py-20 text-center shadow-[0_24px_60px_-30px_rgb(0_0_0_0.3)]"
            >
              <div className="us-bag-float mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-black text-white">
                <ShoppingBag className="h-9 w-9" aria-hidden />
              </div>
              <h2 className="mt-6 text-xl font-bold text-ink">{t('cart.empty')}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
                {t('cart.emptyMessage')}
              </p>
              <Link
                href="/shop"
                className="us-cta us-shine mt-8 inline-flex items-center gap-2 rounded-full bg-black px-9 py-4 text-sm font-bold text-white"
              >
                {t('cart.continueShopping')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer locale={locale} t={t} />
      </div>
    )
  }

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
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
            >
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-mist px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-ink">
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  {t('checkout.title').toUpperCase()}
                </p>
                <h1 className="text-4xl font-bold leading-none tracking-tight text-ink md:text-5xl">
                  {locale === 'ar' ? 'خطوة واحدة وتستلم' : 'Almost yours.'}
                </h1>
                <p className="mt-3 max-w-xl text-sm text-ink/60">
                  {t('checkout.cashOnDeliveryNote')}
                </p>
              </div>

              <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Checkout progress">
                {steps.map((step, i) => (
                  <li key={step.label} className="flex items-center gap-1.5 sm:gap-2">
                    {step.href ? (
                      <Link
                        href={step.href}
                        className="flex items-center gap-2 rounded-full bg-green-600 px-3.5 py-2 text-xs font-bold text-white transition-transform duration-300 hover:scale-105"
                      >
                        <step.icon className="h-3.5 w-3.5" aria-hidden />
                        <span className="hidden sm:inline">{step.label}</span>
                      </Link>
                    ) : (
                      <span
                        className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ${
                          step.state === 'active'
                            ? 'bg-black text-white'
                            : 'bg-brand-mist text-ink/50'
                        }`}
                        aria-current={step.state === 'active' ? 'step' : undefined}
                      >
                        <step.icon className="h-3.5 w-3.5" aria-hidden />
                        <span className="hidden sm:inline">{step.label}</span>
                      </span>
                    )}
                    {i < steps.length - 1 && (
                      <span className="relative h-0.5 w-6 overflow-hidden rounded-full bg-brand-line sm:w-10" aria-hidden>
                        <span
                          className={`us-step-fill absolute inset-0 ${i === 0 ? 'bg-green-600' : 'bg-black'}`}
                        />
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </motion.div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-10">
              {/* ------------------------------------------ FORM */}
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
                className="lg:col-span-2"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="us-form space-y-6">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        key={error}
                        role="alert"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: [0, -8, 8, -4, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45 }}
                        className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
                      >
                        <X className="h-5 w-5 shrink-0" aria-hidden />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 01 Contact */}
                  <section className="rounded-[1.75rem] border border-brand-line bg-white p-6 shadow-[0_20px_50px_-32px_rgb(0_0_0_0.35)] transition-shadow duration-500 focus-within:shadow-[0_28px_60px_-28px_rgb(0_0_0_0.45)] sm:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="us-section-num flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
                        01
                      </span>
                      <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                        <User className="h-5 w-5" aria-hidden />
                        {t('checkout.contactInfo')}
                      </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="customerName">{t('checkout.fullName')} *</Label>
                        <Input
                          id="customerName"
                          {...register('customerName')}
                          error={errors.customerName?.message}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">{t('checkout.email')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          error={errors.email?.message}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t('checkout.phone')} *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="01xxxxxxxxx"
                          {...register('phone')}
                          error={errors.phone?.message}
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondaryPhone">{t('checkout.secondaryPhone')}</Label>
                        <Input id="secondaryPhone" type="tel" {...register('secondaryPhone')} />
                      </div>
                    </div>
                  </section>

                  {/* 02 Address */}
                  <section className="rounded-[1.75rem] border border-brand-line bg-white p-6 shadow-[0_20px_50px_-32px_rgb(0_0_0_0.35)] transition-shadow duration-500 focus-within:shadow-[0_28px_60px_-28px_rgb(0_0_0_0.45)] sm:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="us-section-num flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
                        02
                      </span>
                      <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                        <MapPin className="h-5 w-5" aria-hidden />
                        {t('checkout.shippingAddress')}
                      </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="address">{t('checkout.address')} *</Label>
                        <Input
                          id="address"
                          {...register('address')}
                          error={errors.address?.message}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">{t('checkout.city')} *</Label>
                        <Input id="city" {...register('city')} error={errors.city?.message} />
                      </div>
                      <div>
                        <Label htmlFor="apartment">{t('checkout.apartment')}</Label>
                        <Input id="apartment" {...register('apartment')} />
                      </div>
                    </div>
                  </section>

                  {/* 03 Payment */}
                  <section className="rounded-[1.75rem] border border-brand-line bg-white p-6 shadow-[0_20px_50px_-32px_rgb(0_0_0_0.35)] sm:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="us-section-num flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">
                        03
                      </span>
                      <h2 className="text-lg font-bold text-ink">
                        {t('checkout.paymentMethod')}
                      </h2>
                    </div>
                    <div className="us-pay-selected flex items-start gap-4 rounded-2xl border-2 border-brand bg-brand-mist/40 p-5 transition-all duration-300">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
                        <Banknote className="h-6 w-6" aria-hidden />
                      </span>
                      <div className="flex-1">
                        <p className="flex items-center gap-2 font-bold text-ink">
                          {t('checkout.cashOnDelivery')}
                          <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            {locale === 'ar' ? 'مفعّلة' : 'Active'}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-ink/60">
                          {t('checkout.cashOnDeliveryNote')}
                        </p>
                      </div>
                      <span className="us-check-pop flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                        <Check className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                  </section>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="us-cta us-shine group flex w-full items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-base font-bold text-white disabled:cursor-wait disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        {locale === 'ar' ? 'جاري تأكيد طلبك...' : 'Placing your order...'}
                      </>
                    ) : (
                      <>
                        {t('checkout.placeOrder')} · {formatEGP(orderTotal)}
                        <ArrowRight
                          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                          aria-hidden
                        />
                      </>
                    )}
                  </button>
                  <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink/50">
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                    {locale === 'ar'
                      ? 'بالضغط على تأكيد، فريقنا هيتصل بيك خلال ٢٤ ساعة'
                      : 'Our team will call to confirm within 24 hours'}
                  </p>
                </form>
              </motion.div>

              {/* ------------------------------------------ SUMMARY */}
              <motion.aside
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                className="lg:col-span-1"
              >
                <div className="relative overflow-hidden rounded-[1.75rem] bg-black p-6 text-white shadow-[0_36px_80px_-36px_rgba(0,0,0,0.7)] sm:p-7 lg:sticky lg:top-32">
                  <div className="us-glow absolute -right-16 -top-16 h-56 w-56 rounded-full" aria-hidden />
                  <div className="relative">
                    <h2 className="text-lg font-bold">{t('checkout.orderSummary')}</h2>

                    <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pe-1">
                      <AnimatePresence initial={false}>
                        {cart.map((item) => (
                          <motion.div
                            key={`${item.productId}-${item.size}-${item.color}`}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.3 }}
                            className="flex gap-3"
                          >
                            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.productName}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                                  —
                                </div>
                              )}
                              <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[10px] font-bold text-black">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold">{item.productName}</p>
                              <p className="text-xs text-white/55">
                                {item.size} / {item.color}
                              </p>
                              <p className="mt-0.5 text-sm font-bold text-amber-300">
                                {formatEGP(item.totalPrice)}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Voucher */}
                    <div className="mt-5 border-t border-white/10 pt-5">
                      <AnimatePresence mode="wait">
                        {appliedVoucher ? (
                          <motion.div
                            key={appliedVoucher.code}
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.94 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between gap-2 rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm"
                          >
                            <span className="flex items-center gap-2 font-bold text-green-300">
                              <Tag className="h-4 w-4" aria-hidden />
                              {appliedVoucher.code} · −{formatEGP(appliedVoucher.discount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAppliedVoucher(null)}
                              aria-label={t('voucher.remove')}
                              className="rounded-full p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <X className="h-4 w-4" aria-hidden />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="voucher-form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-2"
                          >
                            <div className="flex gap-2">
                              <input
                                value={voucherInput}
                                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    applyVoucher()
                                  }
                                }}
                                placeholder={t('voucher.placeholder')}
                                aria-label={t('voucher.title')}
                                className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-amber-300 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={applyVoucher}
                                disabled={isApplyingVoucher || !voucherInput.trim()}
                                className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-all duration-300 hover:bg-amber-300 disabled:opacity-40"
                              >
                                {isApplyingVoucher ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                ) : (
                                  t('voucher.apply')
                                )}
                              </button>
                            </div>
                            <AnimatePresence>
                              {voucherError && (
                                <motion.p
                                  key={voucherError}
                                  initial={{ opacity: 0, y: -6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  className="text-xs font-bold text-red-400"
                                >
                                  {voucherError}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">{t('cart.subtotal')}</span>
                        <span className="font-bold">{formatEGP(cartTotal)}</span>
                      </div>
                      <AnimatePresence>
                        {appliedVoucher && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="us-accordion flex justify-between text-green-300"
                          >
                            <span>{t('voucher.discount')}</span>
                            <span className="font-bold">−{formatEGP(discount)}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="flex justify-between">
                        <span className="text-white/60">{locale === 'ar' ? 'التوصيل' : 'Delivery'}</span>
                        <span className="font-bold text-green-400">
                          {locale === 'ar' ? 'عند الاستلام' : 'On delivery'}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="font-bold">{t('cart.total')}</span>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={orderTotal}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.22 }}
                            className="text-3xl font-extrabold tracking-tight text-amber-300"
                          >
                            {formatEGP(orderTotal)}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-xs text-white/60">
                      {[
                        { Icon: Truck, label: locale === 'ar' ? 'توصيل ٢-٥ أيام عمل' : '2–5 business day delivery' },
                        { Icon: RefreshCcw, label: locale === 'ar' ? 'استبدال المقاس مجاناً' : 'Free size exchange' },
                      ].map(({ Icon, label }) => (
                        <p key={label} className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 text-amber-300" aria-hidden />
                          {label}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>
          </div>
        </section>
      </main>

      {/* Success celebration overlay */}
      <AnimatePresence>
        {placedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              className="w-full max-w-sm rounded-[2rem] bg-white p-10 text-center shadow-2xl"
            >
              <span className="us-check-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-white">
                <Check className="h-10 w-10" aria-hidden />
              </span>
              <h2 className="mt-6 text-2xl font-bold text-ink">
                {locale === 'ar' ? 'طلبك اتأكد!' : 'Order placed!'}
              </h2>
              <p className="mt-2 text-sm font-bold tracking-wider text-ink/60">
                {placedOrder}
              </p>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                {locale === 'ar' ? 'جاري تحويلك...' : 'Taking you to confirmation...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer locale={locale} t={t} />
    </div>
  )
}

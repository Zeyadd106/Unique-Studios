'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import {
  ArrowRight,
  Check,
  Lock,
  Minus,
  Plus,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from 'lucide-react'

/* ---------------------------------------------------------------------------
 * Cart — high-converting bag experience:
 * animated checkout steps → spring item list with exit transitions →
 * dark sticky summary → trust strip → empty state that sells.
 * ------------------------------------------------------------------------- */

export default function CartPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const router = useRouter()
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, mounted } =
    useCart()
  const { wishlistCount } = useWishlist()
  const isAr = locale === 'ar'

  if (!mounted) {
    return null
  }

  const format = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(value)

  const handleQuantityChange = (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color)
    } else {
      updateQuantity(productId, size, color, quantity)
    }
  }

  const steps = [
    { icon: ShoppingBag, label: t('nav.cart'), state: 'active' as const },
    { icon: Lock, label: t('checkout.title'), state: 'next' as const },
    { icon: Check, label: isAr ? 'تم' : 'Done', state: 'todo' as const },
  ]

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
            {/* Heading + steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
            >
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-mist px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-ink">
                  <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
                  {t('cart.title').toUpperCase()}
                  {cartCount > 0 && (
                    <span className="rounded-full bg-black px-2 py-0.5 text-[10px] text-white">
                      {cartCount}
                    </span>
                  )}
                </p>
                <h1 className="text-4xl font-bold leading-none tracking-tight text-ink md:text-5xl">
                  {cart.length === 0
                    ? t('cart.title')
                    : isAr
                      ? 'حاجتك جاهزة'
                      : 'Your bag is ready.'}
                </h1>
              </div>

              {/* Checkout steps */}
              <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Checkout progress">
                {steps.map((step, i) => (
                  <li key={step.label} className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                        step.state === 'active'
                          ? 'bg-black text-white'
                          : 'bg-brand-mist text-ink/50'
                      }`}
                      aria-current={step.state === 'active' ? 'step' : undefined}
                    >
                      <step.icon className="h-3.5 w-3.5" aria-hidden />
                      <span className="hidden sm:inline">{step.label}</span>
                    </span>
                    {i < steps.length - 1 && (
                      <span className="relative h-0.5 w-6 overflow-hidden rounded-full bg-brand-line sm:w-10" aria-hidden>
                        {i === 0 && cart.length > 0 && (
                          <span className="us-step-fill absolute inset-0 bg-black" />
                        )}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </motion.div>

            {cart.length === 0 ? (
              /* ------------------------------ EMPTY ------------------------------ */
              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                className="relative overflow-hidden rounded-[2rem] border border-brand-line bg-gradient-to-b from-brand-mist/60 to-white px-6 py-20 text-center"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-2 select-none text-center text-[22vw] font-bold leading-none tracking-tighter text-black/[0.04] sm:text-[10rem]"
                >
                  EMPTY
                </div>
                <div className="us-bag-float relative mx-auto flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-black text-white shadow-[0_28px_60px_-24px_rgba(0,0,0,0.6)]">
                  <ShoppingBag className="h-11 w-11" aria-hidden />
                  <span className="absolute -end-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-sm font-bold text-black">
                    0
                  </span>
                </div>
                <h2 className="relative mt-8 text-2xl font-bold text-ink sm:text-3xl">
                  {t('cart.empty')}
                </h2>
                <p className="relative mx-auto mt-3 max-w-md text-sm text-ink/60">
                  {t('cart.emptyMessage')}
                </p>
                <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/shop"
                    className="us-cta us-shine group inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-9 py-4 text-sm font-bold text-white sm:w-auto"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
                    {t('cart.continueShopping')}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      aria-hidden
                    />
                  </Link>
                  <Link
                    href="/collections/sweatpants"
                    className="us-cta inline-flex w-full items-center justify-center rounded-full border-2 border-brand px-9 py-3.5 text-sm font-bold text-brand transition-colors duration-300 hover:bg-brand hover:text-white sm:w-auto"
                  >
                    {t('nav.sweatpants')}
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* ------------------------------ FILLED ------------------------------ */
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
                {/* Items */}
                <div className="lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-ink/60">
                      <strong className="font-bold text-ink">{cartCount}</strong>{' '}
                      {isAr ? 'قطعة' : cartCount === 1 ? 'item' : 'items'}
                    </p>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/50 underline-offset-4 transition-colors hover:text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      {isAr ? 'إفراغ السلة' : 'Clear bag'}
                    </button>
                  </div>

                  <motion.div layout className="space-y-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {cart.map((item) => (
                        <motion.article
                          key={`${item.productId}-${item.size}-${item.color}`}
                          layout
                          initial={{ opacity: 0, y: 20, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 90, transition: { duration: 0.3 } }}
                          transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                          className="group rounded-[1.5rem] border border-brand-line bg-white p-4 shadow-[0_18px_40px_-28px_rgb(0_0_0_0.3)] transition-shadow duration-500 hover:shadow-[0_28px_60px_-28px_rgb(0_0_0_0.45)] sm:p-5"
                        >
                          <div className="flex gap-4 sm:gap-5">
                            <Link
                              href={`/product/${item.productSlug}`}
                              className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-brand-mist sm:h-32 sm:w-28"
                              aria-label={item.productName}
                            >
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.productName}
                                  width={112}
                                  height={128}
                                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-ink/40">
                                  —
                                </div>
                              )}
                            </Link>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <Link
                                    href={`/product/${item.productSlug}`}
                                    className="block truncate font-bold text-ink hover:underline hover:underline-offset-4"
                                  >
                                    {item.productName}
                                  </Link>
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    <span className="rounded-full bg-brand-mist px-2.5 py-1 text-[11px] font-bold text-ink">
                                      {t('product.size')}: {item.size}
                                    </span>
                                    <span className="rounded-full bg-brand-mist px-2.5 py-1 text-[11px] font-bold text-ink">
                                      {t('product.color')}: {item.color}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  aria-label={t('cart.removeItem')}
                                  onClick={() =>
                                    removeFromCart(item.productId, item.size, item.color)
                                  }
                                  className="rounded-full p-2 text-ink/40 transition-all duration-300 hover:scale-110 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-5 w-5" aria-hidden />
                                </button>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-1 rounded-full border border-brand-line p-1">
                                  <button
                                    type="button"
                                    aria-label={t('cart.updateQuantity')}
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.productId,
                                        item.size,
                                        item.color,
                                        item.quantity - 1
                                      )
                                    }
                                    className="rounded-full p-1.5 transition-colors hover:bg-brand-mist disabled:opacity-30"
                                  >
                                    <Minus className="h-4 w-4" aria-hidden />
                                  </button>
                                  <AnimatePresence mode="wait">
                                    <motion.span
                                      key={item.quantity}
                                      initial={{ opacity: 0, y: 6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -6 }}
                                      transition={{ duration: 0.16 }}
                                      className="w-8 text-center text-sm font-bold"
                                    >
                                      {item.quantity}
                                    </motion.span>
                                  </AnimatePresence>
                                  <button
                                    type="button"
                                    aria-label={t('cart.updateQuantity')}
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.productId,
                                        item.size,
                                        item.color,
                                        item.quantity + 1
                                      )
                                    }
                                    disabled={item.quantity >= 10}
                                    className="rounded-full p-1.5 transition-colors hover:bg-brand-mist disabled:opacity-30"
                                  >
                                    <Plus className="h-4 w-4" aria-hidden />
                                  </button>
                                </div>

                                <div className="text-end">
                                  <AnimatePresence mode="wait">
                                    <motion.p
                                      key={item.totalPrice}
                                      initial={{ opacity: 0, y: 6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -6 }}
                                      transition={{ duration: 0.18 }}
                                      className="text-lg font-extrabold text-ink"
                                    >
                                      {format(item.totalPrice)}
                                    </motion.p>
                                  </AnimatePresence>
                                  <p className="text-xs text-ink/50">
                                    {format(item.unitPrice)} {isAr ? 'للقطعة' : 'each'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  <Link
                    href="/shop"
                    className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-ink/60 transition-colors hover:text-ink"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-line transition-all duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white">
                      <ArrowRight className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-0" aria-hidden />
                    </span>
                    {t('cart.continueShopping')}
                  </Link>
                </div>

                {/* Summary */}
                <aside className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-[1.75rem] bg-black p-7 text-white shadow-[0_36px_80px_-36px_rgba(0,0,0,0.7)] lg:sticky lg:top-32"
                  >
                    <div className="us-glow absolute -right-16 -top-16 h-56 w-56 rounded-full" aria-hidden />
                    <div className="relative">
                      <h2 className="text-lg font-bold">
                        {t('checkout.orderSummary')}
                      </h2>

                      <div className="mt-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">
                            {t('cart.subtotal')} · {cartCount} {isAr ? 'قطعة' : cartCount === 1 ? 'item' : 'items'}
                          </span>
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={cartTotal}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.2 }}
                              className="font-bold"
                            >
                              {format(cartTotal)}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">{isAr ? 'التوصيل' : 'Delivery'}</span>
                          <span className="font-bold text-green-400">
                            {isAr ? 'عند الاستلام' : 'On delivery'}
                          </span>
                        </div>
                      </div>

                      <div className="my-5 h-px bg-white/15" aria-hidden />

                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold">{t('cart.total')}</span>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={cartTotal}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.22 }}
                            className="text-3xl font-extrabold tracking-tight text-amber-300"
                          >
                            {format(cartTotal)}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <p className="mt-1 text-right text-[11px] text-white/50">
                        {isAr ? 'الدفع كاش عند الاستلام' : 'Cash on delivery'}
                      </p>

                      <button
                        type="button"
                        onClick={() => router.push('/checkout')}
                        className="us-cta us-shine group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-black"
                      >
                        {t('cart.checkout')}
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                          aria-hidden
                        />
                      </button>

                      <div className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-xs text-white/60">
                        {[
                          { Icon: Truck, label: isAr ? 'توصيل ٢-٥ أيام عمل' : '2–5 business day delivery' },
                          { Icon: RefreshCcw, label: isAr ? 'استبدال المقاس مجاناً' : 'Free size exchange' },
                          { Icon: ShieldCheck, label: isAr ? 'تأكيد هاتفي خلال ٢٤ ساعة' : 'Phone confirmation within 24h' },
                        ].map(({ Icon, label }) => (
                          <p key={label} className="flex items-center gap-2">
                            <Icon className="h-4 w-4 shrink-0 text-amber-300" aria-hidden />
                            {label}
                          </p>
                        ))}
                        <p className="flex items-center gap-2 pt-1">
                          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {isAr ? 'بياناتك بأمان' : 'Your details stay private'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </aside>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

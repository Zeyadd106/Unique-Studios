'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Copy,
  Home,
  PartyPopper,
  PhoneCall,
  RefreshCcw,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'

/* ---------------------------------------------------------------------------
 * Confirmation — order celebration:
 * confetti burst → drawing check → order ticket with copy →
 * next-steps timeline → conversion CTAs.
 * ------------------------------------------------------------------------- */

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationLoading />}>
      <ConfirmationContent />
    </Suspense>
  )
}

function ConfirmationLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="us-float h-12 w-12 rounded-full border-2 border-white/20 border-t-amber-300 animate-spin" />
    </div>
  )
}

/** Deterministic confetti — golden-angle spiral, no randomness (SSR-safe). */
function useConfetti(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (i * 137.508 * Math.PI) / 180
        const distance = 120 + ((i * 53) % 160)
        const size = 6 + ((i * 7) % 8)
        const colors = ['#f3d27a', '#ffffff', '#4ade80', '#f3d27a', '#ffffff']
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 60,
          size,
          color: colors[i % colors.length],
          round: i % 3 !== 0,
          delay: (i % 8) * 0.04,
          duration: 1.1 + ((i * 13) % 10) / 14,
        }
      }),
    [count]
  )
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const reduceMotion = useReducedMotion()
  const isAr = locale === 'ar'

  const orderNumber = searchParams.get('orderNumber')
  const [copied, setCopied] = useState(false)
  const confetti = useConfetti(28)

  const copyOrderNumber = async () => {
    if (!orderNumber) return
    try {
      await navigator.clipboard.writeText(orderNumber)
    } catch {
      // Clipboard unavailable — still show feedback.
    }
    setCopied(true)
    const timer = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(timer)
  }

  const nextSteps = [
    {
      Icon: PhoneCall,
      title: isAr ? 'هنتصل بيك' : 'We call you',
      text: isAr ? 'تأكيد هاتفي خلال ٢٤ ساعة' : 'Phone confirmation within 24 hours',
    },
    {
      Icon: Truck,
      title: isAr ? 'التوصيل' : 'Delivery',
      text: isAr ? '٢-٥ أيام عمل · الدفع كاش' : '2–5 business days · cash on delivery',
    },
    {
      Icon: RefreshCcw,
      title: isAr ? 'استبدال سهل' : 'Easy exchange',
      text: isAr ? 'استبدال المقاس خلال ١٤ يوم' : 'Size exchange within 14 days',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      <main className="relative flex-1 overflow-hidden">
        <div className="us-glow absolute left-1/2 top-0 h-96 w-[42rem] -translate-x-1/2 rounded-full opacity-70" aria-hidden />
        <div
          aria-hidden
          className="us-text-stroke pointer-events-none absolute inset-x-0 top-6 select-none text-center text-[17vw] font-bold leading-none tracking-tighter opacity-25 lg:text-[10rem]"
        >
          {isAr ? 'شكراً' : 'THANK YOU'}
        </div>

        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-24">
          {/* Confetti burst + drawing check */}
          <div className="relative mx-auto flex h-44 w-44 items-center justify-center" aria-hidden>
            {!reduceMotion &&
              confetti.map((p, i) => (
                <motion.span
                  key={i}
                  className="us-confetti"
                  style={{
                    width: p.size,
                    height: p.round ? p.size : p.size * 0.45,
                    backgroundColor: p.color,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                  animate={{ x: p.x, y: p.y + 120, opacity: 0, rotate: 260 }}
                  transition={{ duration: p.duration, delay: 0.35 + p.delay, ease: 'easeOut' }}
                />
              ))}
            <motion.svg
              viewBox="0 0 100 100"
              className="h-36 w-36"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#4ade80"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
              />
              <motion.path
                d="M32 51 L45 64 L69 38"
                fill="none"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.55, delay: 0.85, ease: 'easeOut' }}
              />
            </motion.svg>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
          >
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
              <PartyPopper className="h-3.5 w-3.5" aria-hidden />
              {isAr ? 'تم استلام طلبك' : 'Order received'}
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {t('confirmation.title')}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              {t('confirmation.message')}
            </p>
          </motion.div>

          {/* Order ticket */}
          {orderNumber && (
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.75, ease: [0.22, 0.61, 0.36, 1] }}
              className="mx-auto mt-9 max-w-md"
            >
              <button
                type="button"
                onClick={copyOrderNumber}
                className="us-ticket group flex w-full items-center justify-between gap-4 rounded-3xl bg-white/5 px-6 py-5 backdrop-blur transition-transform duration-300 hover:scale-[1.02]"
                aria-live="polite"
              >
                <span className="text-start">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
                    {t('confirmation.orderNumber')}
                  </span>
                  <span className="mt-1 block text-2xl font-extrabold tracking-wider text-amber-300">
                    {orderNumber}
                  </span>
                </span>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                    copied ? 'bg-green-500 text-white' : 'bg-white text-black group-hover:bg-amber-300'
                  }`}
                >
                  {copied ? (
                    <Check className="h-5 w-5" aria-hidden />
                  ) : (
                    <Copy className="h-5 w-5" aria-hidden />
                  )}
                </span>
              </button>
              <p className="mt-2 h-4 text-xs font-semibold text-green-300" aria-live="polite">
                {copied ? (isAr ? 'اتنسخ!' : 'Copied!') : ''}
              </p>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mx-auto mt-2 max-w-md text-sm text-white/60"
          >
            {t('confirmation.followUp')}
          </motion.p>

          {/* Next steps */}
          <motion.ol
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 1 } } }}
            className="mx-auto mt-12 grid max-w-2xl gap-4 text-start sm:grid-cols-3"
          >
            {nextSteps.map(({ Icon, title, text }, i) => (
              <motion.li
                key={title}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
                }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <span className="absolute end-4 top-3 text-4xl font-bold text-white/10" aria-hidden>
                  {i + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-black">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 text-sm font-bold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{text}</p>
              </motion.li>
            ))}
          </motion.ol>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.45, ease: 'easeOut' }}
            className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/shop"
              className="us-cta us-shine group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-9 py-4 text-sm font-bold text-black sm:w-auto"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              {t('confirmation.continueShopping')}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                aria-hidden
              />
            </Link>
            {orderNumber && (
              <Link
                href={`/track?orderNumber=${encodeURIComponent(orderNumber)}`}
                className="us-cta inline-flex w-full items-center justify-center rounded-full border border-white/30 px-9 py-4 text-sm font-bold text-white transition-colors duration-300 hover:bg-white/10 sm:w-auto"
              >
                {t('footer.trackOrder')}
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-4 text-sm font-bold text-white/60 transition-colors hover:text-white"
            >
              <Home className="h-4 w-4" aria-hidden />
              {t('nav.home')}
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  CheckCircle2,
  RefreshCcw,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { FacebookIcon, InstagramIcon, TikTokIcon, MailIcon } from '@/components/icons'
import { siteConfig } from '@/lib/site'

interface FooterProps {
  locale: string
  t: (key: string) => string
}

const year = new Date().getFullYear()

export function Footer({ locale, t }: FooterProps) {
  const isAr = locale === 'ar'
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const subscribe = (event: FormEvent) => {
    event.preventDefault()
    if (email.trim().includes('@')) setSubscribed(true)
  }

  const shopLinks = [
    { href: '/shop', label: t('nav.shop') },
    { href: '/collections/crewnecks', label: t('nav.crewnecks') },
    { href: '/collections/off-shoulder', label: t('nav.offShoulder') },
    { href: '/collections/sweatpants', label: t('nav.sweatpants') },
    { href: '/categories', label: t('nav.categories') },
  ]

  const helpLinks = [
    { href: '/track', label: t('footer.trackOrder') },
    { href: '/returns', label: t('footer.returns') },
    { href: '/faq', label: t('footer.faq') },
    { href: '/size-guide', label: t('footer.sizeGuide') },
  ]

  const brandLinks = [
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/contact', label: t('footer.customerService') },
  ]

  const socials = [
    { href: siteConfig.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: siteConfig.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: siteConfig.tiktok, label: 'TikTok', Icon: TikTokIcon },
    { href: `mailto:${siteConfig.email}`, label: 'Email', Icon: MailIcon },
  ]

  const trust = [
    { Icon: Truck, label: isAr ? 'توصيل ٢-٥ أيام' : '2–5 day delivery' },
    { Icon: ShieldCheck, label: t('checkout.cashOnDelivery') },
    { Icon: RefreshCcw, label: isAr ? 'استبدال ١٤ يوم' : '14-day exchange' },
  ]

  return (
    <footer className="relative overflow-hidden bg-black text-white">
      {/* Newsletter */}
      <div className="relative border-b border-white/10">
        <div className="us-glow absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full opacity-70" aria-hidden />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-14 text-center sm:px-8 lg:flex-row lg:justify-between lg:text-start"
        >
          <div className="max-w-md">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
              <Send className="h-3.5 w-3.5" aria-hidden />
              {isAr ? 'النشرة البريدية' : 'Newsletter'}
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              {isAr ? 'كن أول من يعرف عن الدروب الجديد' : 'Be first to know about the next drop.'}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              {isAr ? 'خصم ترحيبي بانتظارك.' : 'Plus a welcome treat in your inbox.'}
            </p>
          </div>

          {subscribed ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-2 rounded-full bg-green-500/15 px-6 py-4 text-sm font-bold text-green-300"
            >
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              {isAr ? 'تم الاشتراك بنجاح!' : "You're in — check your inbox!"}
            </motion.p>
          ) : (
            <form
              onSubmit={subscribe}
              className="us-newsletter flex w-full max-w-md items-center gap-2 rounded-full border border-white/20 bg-white/5 p-1.5 backdrop-blur transition-all duration-300"
            >
              <label htmlFor="footer-newsletter" className="sr-only">
                Email
              </label>
              <input
                id="footer-newsletter"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={isAr ? 'بريدك الإلكتروني' : 'Your email address'}
                className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="us-cta us-shine flex shrink-0 items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black"
              >
                {isAr ? 'اشترك' : 'Join'}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex flex-col gap-5"
        >
          <Link href="/" aria-label="UNIQUE STUDIOS — Home" className="inline-block w-fit">
            <Image
              src="/logo-light.png"
              alt="UNIQUE STUDIOS"
              width={290}
              height={100}
              loading="lazy"
              className="h-12 w-auto object-contain"
            />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                aria-label={label}
                className="us-social rounded-full border border-white/20 p-2.5 text-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-white/50">
            <BadgeCheck className="h-4 w-4 text-amber-300" aria-hidden />
            {t('checkout.cashOnDelivery')} — {t('checkout.cashOnDeliveryNote')}
          </p>
        </motion.div>

        <FooterColumn title={t('nav.shop')} links={shopLinks} />
        <FooterColumn title={t('footer.about')} links={brandLinks} />
        <FooterColumn title={t('footer.help')} links={helpLinks} />
      </div>

      {/* Trust row */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-6 sm:px-8">
          {trust.map(({ Icon, label }) => (
            <span key={label} className="flex items-center gap-2 text-xs font-semibold text-white/60">
              <Icon className="h-4 w-4 text-amber-300" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Giant ghost brand */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p className="us-text-stroke-faint whitespace-nowrap text-center text-[16vw] font-bold leading-[0.85] tracking-tighter lg:text-[11rem]">
          UNIQUE STUDIOS
        </p>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-xs text-white/50 sm:flex-row sm:px-8">
          <p className="text-center sm:text-start">
            {year} {t('common.brandName')}. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/faq" className="us-footer-link">
              {t('footer.faq')}
            </Link>
            <Link href="/returns" className="us-footer-link">
              {t('footer.returns')}
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label={isAr ? 'العودة للأعلى' : 'Back to top'}
              className="us-cta rounded-full border border-white/20 p-2.5 text-white hover:border-amber-300 hover:text-amber-300"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      aria-label={title}
      className="flex flex-col gap-4"
    >
      <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
        {title}
      </h2>
      <ul className="flex flex-col gap-3 text-sm">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="us-footer-link text-white/70">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </motion.nav>
  )
}

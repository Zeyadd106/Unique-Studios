'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUp, CheckCircle2, Send } from 'lucide-react'
import { FacebookIcon, InstagramIcon, TikTokIcon, MailIcon } from '@/components/icons'
import { siteConfig } from '@/lib/site'

interface FooterProps {
  locale: string
  t: (key: string) => string
}

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

  return (
    <footer className="relative bg-black text-white" aria-labelledby="footer-heading">
      {/* Subtle ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--us-gold)_0%,transparent_70%)] opacity-[0.03]"
      />

      {/* Newsletter Section */}
      <div className="relative border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20 lg:flex lg:items-center lg:justify-between lg:gap-10"
        >
          <div className="text-center lg:text-start lg:max-w-xl lg:flex-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              <Send className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              {isAr ? 'النشرة البريدية' : 'Newsletter'}
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {isAr ? 'كن أول من يعرف عن الدروب الجديد' : 'Be first to know about the next drop.'}
            </h2>
            <p className="mt-3 text-sm text-white/50 max-w-sm mx-auto lg:mx-0">
              {isAr ? 'خصم ترحيبي بانتظارك.' : 'Plus a welcome treat in your inbox.'}
            </p>
          </div>

          <div className="mt-8 w-full max-w-md lg:mt-0 lg:flex-0 lg:flex lg:justify-end">
            {subscribed ? (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                className="flex items-center gap-3 rounded-full bg-green-500/10 border border-green-500/20 px-6 py-4 text-sm font-medium text-green-400"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
                {isAr ? 'تم الاشتراك بنجاح!' : "You're in — check your inbox!"}
              </motion.p>
            ) : (
              <form
                onSubmit={subscribe}
                className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 focus-within:border-amber-300/50 focus-within:ring-2 focus-within:ring-amber-300/20"
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
                  className="w-full bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
                  autoComplete="email"
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-all duration-300 hover:shadow-[0_8px_30px_-10px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                  aria-label={isAr ? 'اشترك' : 'Subscribe'}
                >
                  {isAr ? 'اشترك' : 'Join'}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      {/* Link Columns */}
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12 lg:py-20">
        {/* Brand Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          className="flex flex-col gap-6"
        >
          <Link href="/" aria-label="UNIQUE STUDIOS — Home" className="inline-block w-fit">
            <Image
              src="/logo-light.png"
              alt="UNIQUE STUDIOS"
              width={290}
              height={100}
              loading="lazy"
              className="h-11 w-auto object-contain"
            />
          </Link>
          <p className="max-w-xs text-base leading-relaxed text-white/60">
            {t('hero.subtitle')}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap gap-2 pt-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:text-white hover:scale-105 hover:shadow-[0_8px_25px_-8px_rgba(0,0,0,0.4)]"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Shop Column */}
        <FooterColumn title={t('nav.shop')} links={shopLinks} index={1} />
        {/* About Column */}
        <FooterColumn title={t('footer.about')} links={brandLinks} index={2} />
        {/* Help Column */}
        <FooterColumn title={t('footer.help')} links={helpLinks} index={3} />
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
          <p className="text-sm text-white/40 text-center sm:text-start">
            {t('footer.copyright')}
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50" aria-label="Footer legal">
              <Link href="/returns" className="transition-colors duration-200 hover:text-white hover:text-amber-300">
                {t('footer.returns')}
              </Link>
              <Link href="/contact" className="transition-colors duration-200 hover:text-white hover:text-amber-300">
                {t('nav.contact')}
              </Link>
            </nav>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label={isAr ? 'العودة للأعلى' : 'Back to top'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:text-white hover:scale-105 hover:shadow-[0_8px_25px_-8px_rgba(0,0,0,0.4)]"
            >
              <ArrowUp className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
  index,
}: {
  title: string
  links: { href: string; label: string }[]
  index: number
}) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1], delay: index * 0.08 }}
      aria-label={title}
      className="flex flex-col gap-5"
    >
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
        {title}
      </h2>
      <ul className="flex flex-col gap-2.5" role="list">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="relative text-sm text-white/60 transition-colors duration-200 hover:text-amber-300 before:absolute before:inset-0"
              aria-label={link.label}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </motion.nav>
  )
}
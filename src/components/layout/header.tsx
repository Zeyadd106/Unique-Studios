'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  Heart,
  Globe,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { Locale } from '@/lib/i18n'

interface HeaderProps {
  locale: Locale
  setLocale: (locale: Locale) => void
  cartCount: number
  wishlistCount: number
  t: (key: string) => string
}

interface NavChild {
  href: string
  label: string
}

interface NavItem {
  href: string
  label: string
  children?: NavChild[]
}

/** The Shop entry groups the studio's collections. */
function buildNavItems(t: (key: string) => string): NavItem[] {
  return [
    { href: '/', label: t('nav.home') },
    {
      href: '/shop',
      label: t('nav.shop'),
      children: [
        { href: '/shop', label: t('common.shopAll') },
        { href: '/collections/crewnecks', label: t('nav.crewnecks') },
        { href: '/collections/off-shoulder', label: t('nav.offShoulder') },
        { href: '/collections/sweatpants', label: t('nav.sweatpants') },
      ],
    },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ]
}

export function Header({ locale, setLocale, cartCount, wishlistCount, t }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const pathname = usePathname()
  const navItems = buildNavItems(t)

  const messages = [
    t('common.announcement'),
    locale === 'ar'
      ? 'الدروب الجديد وصل — تسوق أحدث القطع'
      : 'The new drop just landed — shop the latest pieces',
    locale === 'ar'
      ? 'استبدال المقاس مجاناً خلال ١٤ يوم'
      : 'Free size exchange within 14 days',
  ]

  // Rotating announcement messages.
  useEffect(() => {
    const id = setInterval(
      () => setMessageIndex((i) => (i + 1) % messages.length),
      4000
    )
    return () => clearInterval(id)
  }, [messages.length])

  // Glass intensifies after scrolling.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile drawer on navigation (deferred for lint-safe effects).
  useEffect(() => {
    const timer = setTimeout(() => setMobileOpen(false), 0)
    return () => clearTimeout(timer)
  }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0])

  return (
    <>
      {/* Announcement bar — rotating brand messages with a shimmer sweep. */}
      <div className="us-announce-shimmer bg-black text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] sm:text-xs"
            >
              {messages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div
        className={`us-header sticky top-0 z-40 w-full border-b bg-white/85 backdrop-blur-xl ${
          scrolled ? 'us-header-scrolled border-brand-line' : 'border-transparent'
        }`}
      >
        <motion.header
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <nav
            aria-label="Top"
            className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:h-[4.5rem] sm:gap-6 lg:px-8"
          >
            {/* Mobile menu button */}
            <div className="flex flex-1 items-center sm:hidden">
              <button
                type="button"
                aria-label={mobileOpen ? t('common.close') : 'Menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((open) => !open)}
                className="rounded-full p-2 text-brand transition-all duration-300 hover:rotate-90 hover:bg-brand-mist"
              >
                <motion.span
                  key={mobileOpen ? 'x' : 'menu'}
                  initial={{ rotate: -60, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="block"
                >
                  {mobileOpen ? (
                    <X className="h-6 w-6" aria-hidden />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden />
                  )}
                </motion.span>
              </button>
            </div>

            {/* Logo */}
            <Link
              href="/"
              aria-label="UNIQUE STUDIOS — Home"
              className="group flex shrink-0 items-center justify-center"
            >
              <Image
                src="/logo-light.png"
                alt="UNIQUE STUDIOS"
                width={420}
                height={145}
                priority
                className={`w-auto object-contain transition-all duration-500 group-hover:scale-105 ${
                  scrolled ? 'h-9 sm:h-11' : 'h-11 sm:h-14 lg:h-16'
                }`}
              />
            </Link>

            {/* Desktop nav — centered */}
            <div className="hidden flex-1 items-center justify-center sm:flex">
              {navItems.slice(0, 5).map((item) => (
                <DesktopNavItem key={item.label} item={item} isActive={isActive} />
              ))}
            </div>

            {/* Desktop actions */}
            <div className="ml-auto hidden flex-1 items-center justify-end gap-1 sm:flex lg:gap-2">
              <button
                type="button"
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="us-cta flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-mist"
                aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              >
                <Globe className="h-4 w-4" aria-hidden />
                <span>{locale === 'en' ? 'عربي' : 'English'}</span>
              </button>

              <Link
                href="/wishlist"
                aria-label={t('nav.wishlist')}
                className="relative rounded-full p-2 text-brand transition-all duration-300 hover:scale-110 hover:bg-brand-mist"
              >
                <Heart className="h-6 w-6" aria-hidden />
                {wishlistCount > 0 && (
                  <span
                    key={wishlistCount}
                    className="us-badge-pop absolute start-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                aria-label={t('nav.cart')}
                className="relative rounded-full p-2 text-brand transition-all duration-300 hover:scale-110 hover:bg-brand-mist"
              >
                <ShoppingBag className="h-6 w-6" aria-hidden />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="us-badge-pop absolute start-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white"
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/search"
                aria-label={t('common.search')}
                className="rounded-full p-2 text-brand transition-all duration-300 hover:scale-110 hover:bg-brand-mist"
              >
                <Search className="h-6 w-6" aria-hidden />
              </Link>
            </div>

            {/* Mobile actions */}
            <div className="ml-auto flex flex-1 items-center justify-end gap-1 sm:hidden">
              <button
                type="button"
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="rounded-full p-2 text-sm font-bold text-brand transition-colors hover:bg-brand-mist"
                aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              >
                <Globe className="h-5 w-5" aria-hidden />
              </button>
              <Link
                href="/wishlist"
                aria-label={t('nav.wishlist')}
                className="relative rounded-full p-2 text-brand transition-colors hover:bg-brand-mist"
              >
                <Heart className="h-5 w-5" aria-hidden />
                {wishlistCount > 0 && (
                  <span
                    key={wishlistCount}
                    className="us-badge-pop absolute start-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                aria-label={t('nav.cart')}
                className="relative rounded-full p-2 text-brand transition-colors hover:bg-brand-mist"
              >
                <ShoppingBag className="h-5 w-5" aria-hidden />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="us-badge-pop absolute start-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white"
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>

          {/* Desktop secondary row */}
          <div className="hidden border-t border-brand-line/60 sm:block">
            <div className="mx-auto flex max-w-7xl items-center justify-center px-4 lg:px-8">
              {navItems.slice(5).map((item) => (
                <DesktopNavItem key={item.label} item={item} isActive={isActive} compact />
              ))}
              <Link
                href="/shop?newArrivals=true"
                className="my-1 ml-2 hidden items-center gap-1 rounded-full bg-black px-4 py-1.5 text-xs font-bold text-white transition-transform duration-300 hover:scale-105 lg:inline-flex"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                {t('nav.newArrivals')}
              </Link>
            </div>
          </div>
        </motion.header>

        {/* Mobile navigation drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
              className="overflow-hidden border-t border-brand-line bg-white/95 backdrop-blur-xl sm:hidden"
            >
              <nav
                aria-label="Mobile"
                className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4"
              >
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                  >
                    <MobileNavItem
                      item={item}
                      isActive={isActive}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </motion.div>
                ))}
                <div className="mt-3 flex items-center gap-3 border-t border-brand-line pt-4">
                  <Link
                    href="/search"
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-bold text-white"
                  >
                    <Search className="h-4 w-4" aria-hidden />
                    {t('common.search')}
                  </Link>
                  <Link
                    href="/shop?newArrivals=true"
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-brand px-4 py-2.5 text-sm font-bold text-brand"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    {t('nav.newArrivals')}
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

function DesktopNavItem({
  item,
  isActive,
  compact = false,
}: {
  item: NavItem
  isActive: (href: string) => boolean
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = Boolean(item.children?.length)
  const active = isActive(item.href)

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href}
        aria-haspopup={hasChildren ? 'true' : undefined}
        aria-expanded={hasChildren ? open : undefined}
        data-active={active}
        className={`us-nav-link flex items-center gap-1 rounded-full text-sm font-semibold transition-colors duration-300 ${
          compact ? 'px-3 py-2' : 'px-4 py-2.5'
        } ${active ? 'text-brand-deep' : 'text-brand/80 hover:text-brand-deep'}`}
      >
        {item.label}
        {hasChildren && (
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        )}
      </Link>

      <AnimatePresence>
        {hasChildren && open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute start-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-2xl border border-brand-line bg-white/95 p-2 shadow-[0_28px_60px_-20px_rgb(0_0_0_0.4)] backdrop-blur-xl"
          >
            {item.children!.map((child, i) => (
              <motion.div
                key={child.href + child.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.03 * i }}
              >
                <Link
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all duration-200 hover:translate-x-1 hover:bg-brand-mist rtl:hover:-translate-x-1 ${
                    isActive(child.href) ? 'bg-brand-mist font-bold text-brand-deep' : 'text-ink'
                  }`}
                >
                  {child.label}
                  <ChevronDown
                    className="h-3.5 w-3.5 -rotate-90 opacity-0 transition-opacity duration-200 group-hover:opacity-60 rtl:rotate-90"
                    aria-hidden
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileNavItem({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem
  isActive: (href: string) => boolean
  onNavigate: () => void
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = Boolean(item.children?.length)
  const active = isActive(item.href)

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
          active ? 'bg-black text-white' : 'text-ink hover:bg-brand-mist'
        }`}
      >
        {item.label}
        {active && <span className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden />}
      </Link>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-xl transition-colors ${open ? 'bg-brand-mist/60' : ''}`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-center justify-between px-4 py-3 text-start text-sm font-semibold ${
          active ? 'text-brand-deep' : 'text-ink'
        }`}
      >
        {item.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col px-2 pb-2">
              {item.children!.map((child) => (
                <Link
                  key={child.href + child.label}
                  href={child.href}
                  onClick={onNavigate}
                  className={`rounded-lg px-4 py-2.5 text-sm transition-colors ${
                    isActive(child.href)
                      ? 'bg-black font-semibold text-white'
                      : 'text-ink/80 hover:bg-white'
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

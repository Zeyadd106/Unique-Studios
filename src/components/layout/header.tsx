'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, ShoppingBag, Heart, Globe } from 'lucide-react'
import { Locale } from '@/lib/i18n'

interface HeaderProps {
  locale: Locale
  setLocale: (locale: Locale) => void
  cartCount: number
  wishlistCount: number
  t: (key: string) => string
}

export function Header({ locale, setLocale, cartCount, wishlistCount, t }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/shop', label: t('nav.shop') },
    { href: '/categories', label: t('nav.categories') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ]

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-black text-white text-center text-[11px] md:text-xs font-semibold px-4 py-2">
        {t('common.announcement')}
      </div>
      <div className="bg-white sticky top-0 w-full z-30 border-b border-[#E2E2E2] vg-header-shadow">
      <header className="relative bg-white text-[#131316] transition-all duration-300 py-4 md:py-5">
        <nav aria-label="Top" className="bg-white w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center">
            {/* Start: mobile menu */}
            <div className="flex-1 flex items-center">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ms-2 rounded-full hover:opacity-70 transition-opacity lg:hidden"
              >
                <span className="sr-only">Open menu</span>
                {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
              {/* Desktop: language switcher on the start side */}
              <button
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="hidden lg:flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
              >
                <Globe className="h-4 w-4" />
                <span>{locale === 'en' ? 'العربية' : 'EN'}</span>
              </button>
            </div>

            {/* Center: logo */}
            <div className="flex flex-1 justify-center items-center">
              <Link
                href="/"
                className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-black whitespace-nowrap"
              >
                {t('common.brandName')}
              </Link>
            </div>

            {/* End: actions */}
            <div className="flex-1 flex items-center justify-end gap-1 md:gap-2">
              {/* Mobile language */}
              <button
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="lg:hidden flex items-center text-xs font-bold px-2 py-2 hover:opacity-70"
              >
                {locale === 'en' ? 'AR' : 'EN'}
              </button>
              <Link
                href="/search"
                aria-label="Search"
                className="p-2 rounded-full hover:opacity-70 transition-opacity"
              >
                <Search className="w-5 h-5" />
              </Link>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative hidden sm:block p-2 rounded-full hover:opacity-70 transition-opacity"
              >
                <Heart className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 end-0 h-4 min-w-4 px-0.5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative p-2 rounded-full hover:opacity-70 transition-opacity"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 end-0 h-4 min-w-4 px-0.5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop nav row — centered, like Van-Graph */}
          <div className="hidden lg:block mt-4">
            <div className="h-full w-full flex justify-center items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-semibold transition-opacity hover:opacity-70 ${
                    pathname === item.href ? 'text-black underline underline-offset-8' : 'text-[#131316]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-[#E2E2E2] bg-white overflow-hidden"
            >
              <nav className="px-4 py-4">
                <div className="flex flex-col">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-sm font-semibold py-3 border-b border-[#F1F1F1] last:border-0 ${
                        pathname === item.href ? 'text-black' : 'text-[#131316]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold py-3 sm:hidden"
                  >
                    {t('nav.wishlist')}
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      </div>
    </>
  )
}

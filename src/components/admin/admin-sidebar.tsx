'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Box,
  Ticket,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
} from 'lucide-react'
import { useState } from 'react'
import type { Locale } from '@/lib/i18n'

interface AdminSidebarProps {
  currentAdmin: { name: string; email: string }
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

export function AdminSidebar({ currentAdmin, locale, setLocale, t }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
    { href: '/admin/orders', icon: ShoppingBag, label: t('admin.orders') },
    { href: '/admin/products', icon: Package, label: t('admin.products') },
    { href: '/admin/categories', icon: Tags, label: t('admin.categories') },
    { href: '/admin/inventory', icon: Box, label: t('admin.inventory') },
    { href: '/admin/vouchers', icon: Ticket, label: t('admin.vouchers') },
    { href: '/admin/settings', icon: Settings, label: t('admin.settings') },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 start-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar — anchored to the inline-start side so it flips in RTL */}
      <aside
        className={`
        fixed start-0 top-0 h-full w-64 bg-[#000000] text-white p-6 z-40 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}
        lg:translate-x-0 rtl:lg:translate-x-0
      `}
      >
        <div className="mb-8">
          <Link href="/" aria-label="Unique Studios - Home" className="inline-block">
            <Image
              src="/logo-dark.png"
              alt={t('common.brandName')}
              width={290}
              height={100}
              className="h-14 w-auto object-contain"
            />
          </Link>
          <p className="text-sm text-gray-400 mt-2">{t('admin.adminPanel')}</p>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive ? 'bg-white text-[#111111]' : 'hover:bg-white/10'}
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Language switcher */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 w-full transition-colors text-sm font-semibold"
        >
          <Globe className="h-5 w-5" />
          <span>{locale === 'en' ? 'العربية' : 'English'}</span>
        </button>

        <div className="border-t border-white/10 pt-6 mt-4">
          <div className="mb-4">
            <p className="text-sm font-medium">{currentAdmin.name}</p>
            <p className="text-xs text-gray-400">{currentAdmin.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('admin.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#000000] bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Mail } from 'lucide-react'
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/icons'
import { siteConfig } from '@/lib/site'

interface FooterProps {
  locale: string
  t: (key: string) => string
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-[#E2E2E2]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full py-5 text-start"
      >
        <h3 className="font-bold text-base">{title}</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-5 flex flex-col gap-3 text-sm">{children}</div>}
    </div>
  )
}

export function Footer({ locale, t }: FooterProps) {
  void locale
  const year = new Date().getFullYear()

  const shopLinks = (
    <>
      <Link href="/shop" className="hover:opacity-70 transition-opacity">
        {t('nav.shop')}
      </Link>
      <Link href="/categories" className="hover:opacity-70 transition-opacity">
        {t('nav.categories')}
      </Link>
      <Link href="/size-guide" className="hover:opacity-70 transition-opacity">
        {t('footer.sizeGuide')}
      </Link>
    </>
  )

  const pagesLinks = (
    <>
      <Link href="/about" className="hover:opacity-70 transition-opacity">
        {t('nav.about')}
      </Link>
      <Link href="/contact" className="hover:opacity-70 transition-opacity">
        {t('nav.contact')}
      </Link>
      <Link href="/contact" className="hover:opacity-70 transition-opacity">
        {t('footer.customerService')}
      </Link>
    </>
  )

  const socials = [
    { href: siteConfig.instagram, label: 'Instagram', Icon: InstagramIcon, external: true },
    { href: siteConfig.facebook, label: 'Facebook', Icon: FacebookIcon, external: true },
    { href: siteConfig.tiktok, label: 'TikTok', Icon: TikTokIcon, external: true },
    { href: `mailto:${siteConfig.email}`, label: 'Email', Icon: Mail, external: true },
  ]

  const helpLinks = (
    <>
      <Link href="/track" className="hover:opacity-70 transition-opacity">
        {t('footer.trackOrder')}
      </Link>
      <Link href="/returns" className="hover:opacity-70 transition-opacity">
        {t('footer.returns')}
      </Link>
      <Link href="/faq" className="hover:opacity-70 transition-opacity">
        {t('footer.faq')}
      </Link>
      <Link href="/size-guide" className="hover:opacity-70 transition-opacity">
        {t('footer.sizeGuide')}
      </Link>
    </>
  )

  const socialButtons = (bordered: boolean) => (
    <div className="flex gap-2">
      {socials.map(({ href, label, Icon, external }) =>
        external ? (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`p-2 rounded-full hover:opacity-70 ${bordered ? 'border border-[#E2E2E2] p-2.5' : ''}`}
          >
            <Icon className="h-5 w-5" />
          </a>
        ) : (
          <Link
            key={label}
            href={href}
            aria-label={label}
            className={`p-2 rounded-full hover:opacity-70 ${bordered ? 'border border-[#E2E2E2] p-2.5' : ''}`}
          >
            <Icon className="h-5 w-5" />
          </Link>
        )
      )}
    </div>
  )

  return (
    <footer className="bg-white text-[#131316] border-t border-[#E2E2E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Desktop grid */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold">{t('common.brandName')}</h3>
            <p className="text-sm text-[#131316]/70">{t('hero.subtitle')}</p>
            {socialButtons(false)}
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <h3 className="font-bold text-base">{t('nav.shop')}</h3>
            {shopLinks}
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <h3 className="font-bold text-base">{t('footer.about')}</h3>
            {pagesLinks}
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <h3 className="font-bold text-base">{t('footer.help')}</h3>
            {helpLinks}
            <p className="text-[#131316]/60 text-xs mt-2">
              {t('checkout.cashOnDelivery')} — {t('checkout.cashOnDeliveryNote')}
            </p>
          </div>
        </div>

        {/* Mobile accordions */}
        <div className="lg:hidden">
          <div className="pb-6">
            <h3 className="text-lg font-extrabold mb-1">{t('common.brandName')}</h3>
            <p className="text-sm text-[#131316]/70">{t('hero.subtitle')}</p>
          </div>
          <Accordion title={t('nav.shop')}>{shopLinks}</Accordion>
          <Accordion title={t('footer.about')}>{pagesLinks}</Accordion>
          <Accordion title={t('footer.help')}>{helpLinks}</Accordion>
          <div className="mt-6">{socialButtons(true)}</div>
        </div>

        <div className="border-t border-[#E2E2E2] mt-8 pt-6 text-center text-xs text-[#131316]/60">
          <p>
            © {year} {t('common.brandName')}. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}

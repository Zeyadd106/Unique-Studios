'use client'

import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/use-translation'
import { WhatsAppIcon } from '@/components/icons'
import { siteConfig } from '@/lib/site'

// Floating WhatsApp chat button (hidden in admin). Number lives in
// src/lib/site.ts; the prefilled message in src/messages → contact.*.
export function WhatsAppFloat() {
  const pathname = usePathname()
  const { t } = useTranslation()

  if (pathname?.startsWith('/admin')) return null

  const number = siteConfig.whatsapp
  const message = encodeURIComponent(t('contact.whatsappMessage'))

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="group fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center"
    >
      {/* Soft expanding rings */}
      <span aria-hidden="true" className="vg-wa-ring" />
      <span aria-hidden="true" className="vg-wa-ring vg-wa-ring-delay" />
      {/* Button */}
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
        <WhatsAppIcon className="h-7 w-7" />
      </span>
    </a>
  )
}

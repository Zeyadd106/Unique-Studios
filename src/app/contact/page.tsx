'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/icons'
import { siteConfig } from '@/lib/site'

export default function ContactPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const contactInfo = {
    phone: siteConfig.phone,
    email: siteConfig.email,
    address: locale === 'ar' ? siteConfig.address.ar : siteConfig.address.en,
  }

  const whatsappNumber = siteConfig.whatsapp

  const socials = [
    { href: siteConfig.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: siteConfig.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: siteConfig.tiktok, label: 'TikTok', Icon: TikTokIcon },
    { href: `https://wa.me/${whatsappNumber}`, label: 'WhatsApp', Icon: MessageCircle },
    { href: `mailto:${siteConfig.email}`, label: 'Email', Icon: Mail },
  ]

  // No backend for messages — compose the note into WhatsApp instead of a dead form.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = encodeURIComponent(
      `${t('contact.name')}: ${name}\n${t('contact.email')}: ${email}\n${t('contact.subject')}: ${subject}\n\n${message}`
    )
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank')
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center">
              {t('contact.title')}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Contact Information */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">{t('contact.contact')}</h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Phone className="h-5 w-5 mt-1 text-gray-600 shrink-0" />
                      <div>
                        <p className="font-medium">{t('contact.phone')}</p>
                        <a
                          href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                          className="text-gray-600 hover:text-black"
                          dir="ltr"
                        >
                          {contactInfo.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Mail className="h-5 w-5 mt-1 text-gray-600 shrink-0" />
                      <div>
                        <p className="font-medium">{t('contact.email')}</p>
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className="text-gray-600 hover:text-black"
                        >
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 mt-1 text-gray-600 shrink-0" />
                      <div>
                        <p className="font-medium">{t('contact.address')}</p>
                        <p className="text-gray-600">{contactInfo.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-semibold mb-4">{t('contact.socialMedia')}</h3>
                    <div className="flex gap-2">
                      {socials.map(({ href, label, Icon }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="p-2.5 rounded-full border border-[#E2E2E2] text-gray-600 hover:text-black hover:opacity-70 transition"
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">{t('contact.sendMessage')}</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t('contact.name')}</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('contact.namePlaceholder')}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">{t('contact.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('contact.emailPlaceholder')}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">{t('contact.subject')}</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t('contact.subjectPlaceholder')}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">{t('contact.message')}</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('contact.messagePlaceholder')}
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <MessageCircle className="h-4 w-4 me-2" />
                      {t('contact.sendMessage')}
                    </Button>
                    <p className="text-xs text-center text-gray-500">{t('contact.whatsappNote')}</p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

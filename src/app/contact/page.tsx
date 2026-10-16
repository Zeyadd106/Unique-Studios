'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { Mail, Phone, MapPin, MessageCircle, Send, Sparkles, Globe, Heart } from 'lucide-react'
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
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const text = encodeURIComponent(
      `${t('contact.name')}: ${name}\n${t('contact.email')}: ${email}\n${t('contact.subject')}: ${subject}\n\n${message}`
    )
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank')
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-brand-mist/20 to-white">
      <Header
        locale={locale}
        setLocale={setLocale}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        t={t}
      />

      <main className="flex-1 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="pointer-events-none absolute top-20 right-10 h-72 w-72 rounded-full bg-brand/5 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-20 left-10 h-96 w-96 rounded-full bg-brand/5 blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <section className="relative py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12 max-w-4xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-brand" />
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink/50">
                  {t('contact.title').toUpperCase()}
                </p>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl"
              >
                {t('contact.title')}
              </motion.h1>
            </motion.div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              {/* Contact information */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <Card className="relative overflow-hidden border-2 border-brand/10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-brand/5 transition-all duration-300 hover:shadow-brand/10 hover:border-brand/20">
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <CardHeader className="relative">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-brand" />
                        {t('contact.contact')}
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-6">
                      {[
                        { icon: Phone, label: t('contact.phone'), value: contactInfo.phone, href: `tel:${contactInfo.phone.replace(/\s/g, '')}` },
                        { icon: Mail, label: t('contact.email'), value: contactInfo.email, href: `mailto:${contactInfo.email}` },
                        { icon: MapPin, label: t('contact.address'), value: contactInfo.address, href: null },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="group flex items-start gap-4 rounded-lg bg-brand-mist/30 p-4 transition-all duration-300 hover:bg-brand-mist/50"
                        >
                          <motion.div
                            className="mt-1 h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-brand to-brand/60 p-2 text-white shadow-lg shadow-brand/20"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <item.icon className="h-5 w-5" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="font-semibold text-ink transition-colors group-hover:text-brand">
                              {item.label}
                            </p>
                            {item.href ? (
                              <a
                                href={item.href}
                                dir="ltr"
                                className="text-ink/70 transition-all hover:text-brand hover:underline hover:underline-offset-4"
                              >
                                {item.value}
                              </a>
                            ) : (
                              <p className="text-ink/70">{item.value}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-8"
                    >
                      <h3 className="mb-4 flex items-center gap-2 font-semibold text-ink">
                        <Heart className="h-4 w-4 text-brand" />
                        {t('contact.socialMedia')}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {socials.map(({ href, label, Icon }, index) => (
                          <motion.a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            whileHover={{ scale: 1.15, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative group"
                          >
                            <motion.div
                              className="rounded-full border-2 border-brand/20 bg-white p-3 text-ink shadow-lg transition-all group-hover:border-brand group-hover:text-brand group-hover:shadow-brand/30"
                              whileHover={{
                                boxShadow: "0 0 20px rgba(var(--brand-rgb), 0.3)",
                              }}
                            >
                              <Icon className="h-5 w-5" />
                            </motion.div>
                            <motion.div
                              className="pointer-events-none absolute inset-0 rounded-full bg-brand/20 blur-xl opacity-0 transition-opacity group-hover:opacity-100"
                              animate={{
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                <Card className="relative overflow-hidden border-2 border-brand/10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-brand/5 transition-all duration-300 hover:shadow-brand/10 hover:border-brand/20">
                  <motion.div
                    className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-brand/10 to-transparent blur-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <CardHeader className="relative">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-brand" />
                        {t('contact.sendMessage')}
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {[
                        { id: 'name', label: t('contact.name'), placeholder: t('contact.namePlaceholder'), value: name, onChange: setName },
                        { id: 'email', label: t('contact.email'), type: 'email', placeholder: t('contact.emailPlaceholder'), value: email, onChange: setEmail },
                        { id: 'subject', label: t('contact.subject'), placeholder: t('contact.subjectPlaceholder'), value: subject, onChange: setSubject },
                      ].map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <Label htmlFor={field.id} className="mb-2 text-sm font-semibold text-ink">
                            {field.label}
                          </Label>
                          <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                            <Input
                              id={field.id}
                              type={field.type || 'text'}
                              value={field.value}
                              onChange={(event) => field.onChange(event.target.value)}
                              placeholder={field.placeholder}
                              required
                              className="border-2 border-brand/20 bg-white/50 text-ink transition-all duration-300 focus:border-brand focus:bg-white focus:shadow-lg focus:shadow-brand/20"
                            />
                          </motion.div>
                        </motion.div>
                      ))}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Label htmlFor="message" className="mb-2 text-sm font-semibold text-ink">
                          {t('contact.message')}
                        </Label>
                        <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                          <Textarea
                            id="message"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder={t('contact.messagePlaceholder')}
                            rows={5}
                            required
                            className="border-2 border-brand/20 bg-white/50 text-ink transition-all duration-300 focus:border-brand focus:bg-white focus:shadow-lg focus:shadow-brand/20 resize-none"
                          />
                        </motion.div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="submit"
                            className="relative w-full overflow-hidden bg-gradient-to-r from-brand to-brand/90 text-white shadow-xl shadow-brand/30 transition-all duration-300 hover:shadow-brand/50"
                          >
                            <motion.div
                              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{
                                x: ['-100%', '100%'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                            <span className="relative flex items-center justify-center gap-2 font-semibold">
                              <MessageCircle className="h-5 w-5" />
                              {t('contact.sendMessage')}
                            </span>
                          </Button>
                        </motion.div>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 }}
                          className="mt-3 text-center text-xs text-ink/50"
                        >
                          {t('contact.whatsappNote')}
                        </motion.p>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'

export default function AboutPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        locale={locale} 
        setLocale={setLocale} 
        cartCount={cartCount} 
        wishlistCount={wishlistCount}
        t={t}
      />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">{t('about.title')}</h1>
            
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-bold mb-4">{t('about.ourStory')}</h2>
                <p className="text-gray-600 leading-relaxed">
                  UNIQUE STUDIOS was founded with a simple vision: to create streetwear that breaks boundaries and 
                  empowers individuality. We believe that fashion should be a form of self-expression – bold, 
                  authentic, and unapologetically unique.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Our journey began with a passion for oversized fits and premium quality. We noticed a gap in the 
                  market for streetwear that combined modern aesthetics with exceptional craftsmanship. 
                  Every piece in our collection is designed with meticulous attention to detail, using only the 
                  finest materials to ensure comfort and durability.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">{t('about.ourVision')}</h2>
                <p className="text-gray-600 leading-relaxed">
                  We envision a world where everyone feels confident expressing their unique style through fashion. 
                  Our goal is to become the go-to destination for premium streetwear enthusiasts who value quality, 
                  authenticity, and individuality.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  We're constantly pushing boundaries, experimenting with new designs, and staying ahead of trends 
                  while remaining true to our core values of quality and authenticity.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">{t('about.ourStyle')}</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our style is defined by oversized silhouettes, clean lines, and premium materials. We draw 
                  inspiration from street culture, modern art, and urban landscapes to create pieces that are 
                  both timeless and contemporary.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  From our essential oversized t-shirts to our signature wide-leg sweatpants, every item is designed 
                  to make a statement. We believe that great fashion should be comfortable, versatile, and 
                  effortlessly cool.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">{t('about.quality')}</h2>
                <p className="text-gray-600 leading-relaxed">
                  Quality is at the heart of everything we do. We source the finest materials, work with skilled 
                  craftsmen, and implement rigorous quality control measures to ensure that every piece meets 
                  our exacting standards.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Our heavyweight cotton, premium stitching, and attention to detail set us apart. We don't 
                  compromise on quality, and neither should you.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">{t('about.community')}</h2>
                <p className="text-gray-600 leading-relaxed">
                  We're more than just a clothing brand – we're a community of like-minded individuals who 
                  share a passion for authentic self-expression. Our customers are our inspiration, and we're 
                  committed to building a brand that resonates with people who dare to be different.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Join us on this journey. Express yourself. Be unique. Wear UNIQUE STUDIOS.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}
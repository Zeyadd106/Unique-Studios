'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CartPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, mounted } = useCart()
  const router = useRouter()

  if (!mounted) {
    return null
  }

  const handleQuantityChange = (item: any, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.productId, item.size, item.color)
    } else {
      updateQuantity(item.productId, item.size, item.color, newQuantity)
    }
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        locale={locale} 
        setLocale={setLocale} 
        cartCount={cartCount} 
        wishlistCount={0}
        t={t}
      />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">{t('cart.title')}</h1>

          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('cart.empty')}</h2>
              <p className="text-gray-600 mb-6">{t('cart.emptyMessage')}</p>
              <Link href="/shop">
                <Button size="lg">
                  {t('cart.continueShopping')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, index) => (
                  <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="bg-white rounded-md border border-[#E2E2E2] p-3 sm:p-4 flex gap-3 sm:gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F3F3F3] rounded-md flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{item.productName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t('product.size')}: {item.size} | {t('product.color')}: {item.color}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          aria-label={t('cart.removeItem')}
                          className="p-2 -m-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            aria-label={t('cart.updateQuantity')}
                            className="p-2 hover:bg-gray-100 rounded-md"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            aria-label={t('cart.updateQuantity')}
                            className="p-2 hover:bg-gray-100 rounded-md"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-end shrink-0">
                          <p className="font-semibold text-sm sm:text-base">
                            {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                              style: 'currency',
                              currency: 'EGP',
                            }).format(item.totalPrice)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                              style: 'currency',
                              currency: 'EGP',
                            }).format(item.unitPrice)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-md border border-[#E2E2E2] p-6 lg:sticky lg:top-28">
                  <h2 className="text-xl font-semibold mb-4">{t('checkout.orderSummary')}</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('cart.subtotal')}</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                          style: 'currency',
                          currency: 'EGP',
                        }).format(cartTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('cart.total')}</span>
                      <span className="font-bold text-lg">
                        {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                          style: 'currency',
                          currency: 'EGP',
                        }).format(cartTotal)}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleCheckout}
                  >
                    {t('cart.checkout')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Link href="/shop" className="block mt-4 text-center">
                    <Button variant="ghost" size="sm" className="w-full">
                      {t('cart.continueShopping')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}
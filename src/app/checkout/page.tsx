'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations'
import { Loader2, ShoppingBag, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cart, cartTotal, cartCount, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = async (data: CheckoutFormData) => {
    if (cart.length === 0) {
      setError('Your cart is empty')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          items: cart,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const order = await response.json()
      
      // Clear cart
      clearCart()
      
      // Redirect to confirmation page
      router.push(`/confirmation?orderNumber=${order.orderNumber}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0) {
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
          </div>
        </main>
        <Footer locale={locale} t={t} />
      </div>
    )
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
          <h1 className="text-3xl md:text-4xl font-bold mb-8">{t('checkout.title')}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('checkout.guestCheckout')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    {/* Contact Information */}
                    <div>
                      <h3 className="font-semibold mb-4">{t('checkout.contactInfo')}</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="customerName">{t('checkout.fullName')} *</Label>
                          <Input
                            id="customerName"
                            {...register('customerName')}
                            error={errors.customerName?.message}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">{t('checkout.email')} *</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">{t('checkout.phone')} *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            {...register('phone')}
                            error={errors.phone?.message}
                          />
                        </div>
                        <div>
                          <Label htmlFor="secondaryPhone">{t('checkout.secondaryPhone')}</Label>
                          <Input
                            id="secondaryPhone"
                            type="tel"
                            {...register('secondaryPhone')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="font-semibold mb-4">{t('checkout.shippingAddress')}</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="address">{t('checkout.address')} *</Label>
                          <Input
                            id="address"
                            {...register('address')}
                            error={errors.address?.message}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">{t('checkout.city')} *</Label>
                          <Input
                            id="city"
                            {...register('city')}
                            error={errors.city?.message}
                          />
                        </div>
                        <div>
                          <Label htmlFor="apartment">{t('checkout.apartment')}</Label>
                          <Input
                            id="apartment"
                            {...register('apartment')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <Label htmlFor="notes">{t('checkout.notes')}</Label>
                      <Textarea
                        id="notes"
                        {...register('notes')}
                        rows={3}
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="font-semibold mb-4">{t('checkout.paymentMethod')}</h3>
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Check className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">{t('checkout.cashOnDelivery')}</p>
                            <p className="text-sm text-gray-600">{t('checkout.cashOnDeliveryNote')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {t('checkout.placeOrder')}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t('checkout.orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, index) => (
                      <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.productName}</p>
                          <p className="text-xs text-gray-600">
                            {item.size} / {item.color} × {item.quantity}
                          </p>
                          <p className="text-sm font-semibold">
                            {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                              style: 'currency',
                              currency: 'EGP',
                            }).format(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('cart.subtotal')}</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                          style: 'currency',
                          currency: 'EGP',
                        }).format(cartTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">{t('cart.total')}</span>
                      <span className="font-bold">
                        {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                          style: 'currency',
                          currency: 'EGP',
                        }).format(cartTotal)}
                      </span>
                    </div>
                  </div>

                  <Link href="/cart" className="block mt-4">
                    <Button variant="ghost" size="sm" className="w-full">
                      {t('checkout.backToCart')}
                    </Button>
                  </Link>
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
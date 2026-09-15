'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useWishlist } from '@/hooks/use-wishlist'
import { useCart } from '@/hooks/use-cart'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { wishlist, removeFromWishlist, clearWishlist, mounted } = useWishlist()
  const { cartCount, addToCart } = useCart()

  if (!mounted) {
    return null
  }

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId)
  }

  const handleMoveToCart = async (productId: string) => {
    try {
      const response = await fetch(`/api/product?slug=${productId}`)
      if (response.ok) {
        const product = await response.json()
        const defaultVariant = product.variants[0]
        if (defaultVariant) {
          addToCart({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            image: product.images[0]?.url || '',
            size: defaultVariant.size,
            color: defaultVariant.color,
            quantity: 1,
            unitPrice: product.salePrice || product.price,
            totalPrice: product.salePrice || product.price,
          })
          removeFromWishlist(productId)
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        locale={locale} 
        setLocale={setLocale} 
        cartCount={cartCount} 
        wishlistCount={wishlist.length}
        t={t}
      />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">{t('nav.wishlist')}</h1>
            {wishlist.length > 0 && (
              <Button variant="outline" onClick={clearWishlist}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Save items you love by clicking the heart icon</p>
              <Link href="/shop">
                <Button size="lg">
                  {t('cart.continueShopping')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlist.map((productId) => (
                <WishlistItem
                  key={productId}
                  productId={productId}
                  onRemove={handleRemoveFromWishlist}
                  onMoveToCart={handleMoveToCart}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}

function WishlistItem({ 
  productId, 
  onRemove, 
  onMoveToCart, 
  locale, 
  t 
}: { 
  productId: string
  onRemove: (id: string) => void
  onMoveToCart: (id: string) => void
  locale: string
  t: (key: string) => string
}) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/product?slug=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        <div className="aspect-square bg-gray-100 rounded-lg animate-pulse mb-4" />
        <div className="h-4 bg-gray-100 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-black transition-colors">
      <div className="relative aspect-square bg-gray-100">
        {product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        <button
          onClick={() => onRemove(productId)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold mb-2 hover:text-gray-600">{product.name}</h3>
        </Link>
        <div className="flex items-center space-x-2 mb-3">
          {product.salePrice ? (
            <>
              <span className="font-bold">
                {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                  style: 'currency',
                  currency: 'EGP',
                }).format(product.salePrice)}
              </span>
              <span className="text-gray-400 line-through text-sm">
                {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                  style: 'currency',
                  currency: 'EGP',
                }).format(product.price)}
              </span>
            </>
          ) : (
            <span className="font-bold">
              {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                style: 'currency',
                currency: 'EGP',
              }).format(product.price)}
            </span>
          )}
        </div>
        <Button
          size="sm"
          className="w-full"
          onClick={() => onMoveToCart(productId)}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          {t('product.addToCart')}
        </Button>
      </div>
    </div>
  )
}
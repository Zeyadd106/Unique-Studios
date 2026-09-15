'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { Search, ShoppingBag, Heart } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'

export default function SearchPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount, addToCart } = useCart()
  const { wishlistCount, addToWishlist, isInWishlist } = useWishlist()
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (query.length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        performSearch()
      }, 300)
      return () => clearTimeout(delayDebounceFn)
    }
  }, [query])

  const performSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)
      setSearched(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    const defaultVariant = product.variants[0]
    if (!defaultVariant) return

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
  }

  const handleAddToWishlist = (productId: string) => {
    if (isInWishlist(productId)) return
    addToWishlist(productId)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        locale={locale} 
        setLocale={setLocale} 
        cartCount={cartCount} 
        wishlistCount={wishlistCount}
        t={t}
      />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('common.searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
                autoFocus
              />
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">{t('common.noResults')}</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <p className="text-gray-600 mb-6">
                Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-black transition-colors group">
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
                      <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAddToWishlist(product.id)}
                          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>
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
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        {t('product.addToCart')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}
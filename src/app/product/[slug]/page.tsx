'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { Heart, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react'
import { Product } from '@/types'
import { ReviewsSection } from '@/components/product/reviews'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount, addToCart } = useCart()
  const { wishlistCount, addToWishlist, isInWishlist } = useWishlist()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  const fetchProduct = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/product?slug=${slug}`)
      const data = await response.json()
      setProduct(data)
      
      // Set default selections
      if (data.variants && data.variants.length > 0) {
        setSelectedSize(data.variants[0].size)
        setSelectedColor(data.variants[0].color)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAvailableSizes = () => {
    if (!product) return []
    const sizes = [...new Set(product.variants.map(v => v.size))]
    return sizes.sort()
  }

  const getAvailableColors = () => {
    if (!product) return []
    const colors = [...new Set(product.variants.map(v => v.color))]
    return colors.sort()
  }

  const getSelectedVariant = () => {
    if (!product || !selectedSize || !selectedColor) return null
    return product.variants.find(
      v => v.size === selectedSize && v.color === selectedColor
    )
  }

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) return
    
    const variant = getSelectedVariant()
    if (!variant || variant.stock < quantity) return

    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[selectedImage]?.url || '',
      size: selectedSize,
      color: selectedColor,
      quantity,
      unitPrice: product.salePrice || product.price,
      totalPrice: quantity * (product.salePrice || product.price),
    })

    // Take the customer straight to the cart to review their items.
    router.push('/cart')
  }

  const handleAddToWishlist = () => {
    if (!product) return
    if (isInWishlist(product.id)) return
    addToWishlist(product.id)
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header 
          locale={locale} 
          setLocale={setLocale} 
          cartCount={cartCount} 
          wishlistCount={wishlistCount}
          t={t}
        />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header 
          locale={locale} 
          setLocale={setLocale} 
          cartCount={cartCount} 
          wishlistCount={wishlistCount}
          t={t}
        />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">{t('errors.productNotFound')}</p>
        </main>
      </div>
    )
  }

  const variant = getSelectedVariant()
  const isOutOfStock = !variant || variant.stock === 0
  const isLowStock = variant && variant.stock > 0 && variant.stock <= 5

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.images[selectedImage] ? (
                  <img
                    src={product.images[selectedImage].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-black' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                {product.newArrival && (
                  <Badge variant="default" className="mb-2">
                    {t('product.new')}
                  </Badge>
                )}
                {product.salePrice && (
                  <Badge variant="error" className="mb-2 ml-2">
                    {t('product.sale')}
                  </Badge>
                )}
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-600">{product.category.name}</p>
              </div>

              <div className="flex items-center space-x-4">
                {product.salePrice ? (
                  <>
                    <span className="text-3xl font-bold">
                      {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                        style: 'currency',
                        currency: 'EGP',
                      }).format(product.salePrice)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                        style: 'currency',
                        currency: 'EGP',
                      }).format(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">
                    {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                      style: 'currency',
                      currency: 'EGP',
                    }).format(product.price)}
                  </span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed">{product.description}</p>

              {/* Size Selection */}
              <div>
                <label className="block font-medium mb-3">{t('product.size')}</label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableSizes().map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!product.variants.some(v => v.size === size && v.stock > 0)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {variant && variant.weightMin && variant.weightMax && (
                  <p className="text-sm text-gray-500 mt-2">
                    {t('product.weightRecommendation')}: {variant.weightMin}-{variant.weightMax} kg
                  </p>
                )}
              </div>

              {/* Color Selection */}
              <div>
                <label className="block font-medium mb-3">{t('product.color')}</label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableColors().map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      disabled={!product.variants.some(v => v.color === color && v.stock > 0)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium ${
                        selectedColor === color
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-medium mb-3">{t('product.quantity')}</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border-0"
                      min="1"
                      max="10"
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              {isOutOfStock && (
                <Badge variant="error" className="text-sm">
                  {t('product.outOfStock')}
                </Badge>
              )}
              {isLowStock && (
                <Badge variant="warning" className="text-sm">
                  {t('product.lowStock')} ({variant?.stock} left)
                </Badge>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {t('product.addToCart')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleAddToWishlist}
                  disabled={isInWishlist(product.id)}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  {isInWishlist(product.id) ? t('product.removeFromWishlist') : t('product.addToWishlist')}
                </Button>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="font-semibold">{t('product.details')}</h3>
                {product.material && (
                  <div>
                    <span className="text-gray-600">{t('product.material')}:</span>
                    <span className="ml-2">{product.material}</span>
                  </div>
                )}
                {product.fit && (
                  <div>
                    <span className="text-gray-600">{t('product.fit')}:</span>
                    <span className="ml-2">{product.fit}</span>
                  </div>
                )}
                {product.careInstructions && (
                  <div>
                    <span className="text-gray-600">{t('product.careInstructions')}:</span>
                    <span className="ml-2">{product.careInstructions}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500">{t('product.weightNote')}</p>
            </div>
          </div>

          <ReviewsSection productId={product.id} locale={locale} t={t} />
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}
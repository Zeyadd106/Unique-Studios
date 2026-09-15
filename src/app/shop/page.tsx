'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ProductCard } from '@/components/product/product-card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useCart } from '@/hooks/use-cart'
import { useWishlist } from '@/hooks/use-wishlist'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Product } from '@/types'

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  )
}

function ShopLoading() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <p className="text-gray-600">...</p>
    </div>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { cartCount } = useCart()
  const { wishlistCount, addToWishlist, isInWishlist } = useWishlist()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  // Deep-link support: /shop?category=hoodies preselects the filter.
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get('category') ?? ''
  )
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  const sizes = ['S', 'M', 'L', 'XL', 'XXL']
  const colors = ['Black', 'White', 'Gray', 'Navy']

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [search, selectedCategory, selectedSize, selectedColor, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedSize) params.append('size', selectedSize)
      if (selectedColor) params.append('color', selectedColor)
      params.append('sort', sortBy)

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      // API returns an array on success but { error } on failure —
      // guard so `products` is always an array and .map never crashes.
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const handleAddToWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      return
    }
    addToWishlist(productId)
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setSelectedSize('')
    setSelectedColor('')
    setSortBy('featured')
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('nav.shop')}</h1>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('common.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {t('common.filter')}
              </Button>

              <div className="flex items-center space-x-4">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'featured', label: t('sort.featured') },
                    { value: 'newest', label: t('sort.newest') },
                    { value: 'priceLow', label: t('sort.priceLow') },
                    { value: 'priceHigh', label: t('sort.priceHigh') },
                    { value: 'bestSelling', label: t('sort.bestSelling') },
                  ]}
                  className="w-full md:w-auto"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t('common.filter')}</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Clear
                  </button>
                </div>

                {/* Category Filter */}
                <div>
                  <h4 className="font-medium mb-3">{t('filters.allCategories')}</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={selectedCategory === ''}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span>{t('filters.allCategories')}</span>
                    </label>
                    {(Array.isArray(categories) ? categories : []).map((category) => (
                      <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={category.slug}
                          checked={selectedCategory === category.slug}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div>
                  <h4 className="font-medium mb-3">{t('product.size')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                        className={`px-3 py-1 rounded border-2 ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div>
                  <h4 className="font-medium mb-3">{t('product.color')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                        className={`px-3 py-1 rounded border-2 ${
                          selectedColor === color
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i}>
                      <div className="vg-skeleton aspect-[3/4] rounded-md" />
                      <div className="vg-skeleton mt-3 h-3 w-3/4 rounded" />
                      <div className="vg-skeleton mt-2 h-3 w-1/3 rounded" />
                    </div>
                  ))}
                </div>
              ) : !Array.isArray(products) || products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">{t('common.noResults')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-6">
                  {(Array.isArray(products) ? products : []).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                      newLabel={t('product.new')}
                      saleLabel={t('product.sale')}
                      isInWishlist={isInWishlist}
                      onToggleWishlist={handleAddToWishlist}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} t={t} />
    </div>
  )
}
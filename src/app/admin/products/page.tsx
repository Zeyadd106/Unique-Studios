'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  active: boolean
  featured: boolean
  bestSeller: boolean
  newArrival: boolean
  category: { name: string }
  images: { url: string }[]
  variants: { size: string; color: string; stock: number }[]
}

export default function AdminProductsPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })

  useEffect(() => {
    fetchProducts()
    const adminName = localStorage.getItem('adminName') || 'Admin'
    const adminEmail = localStorage.getItem('adminEmail') || 'admin@uniquestudios.com'
    setCurrentAdmin({ name: adminName, email: adminEmail })
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar currentAdmin={currentAdmin} locale={locale} setLocale={setLocale} t={t} />
        <main className="flex-1 lg:ms-64 p-4 md:p-8">
          <p>{t('admin.loading')}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentAdmin={currentAdmin} locale={locale} setLocale={setLocale} t={t} />

      <main className="flex-1 lg:ms-64 p-4 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t('admin.products')}</h1>
            <p className="text-gray-600">{t('admin.manageProducts')}</p>
          </div>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 me-2" />
              {t('admin.addProduct')}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.allProducts')} ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('admin.noProducts')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                        {product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {product.featured && <Badge variant="default">{t('admin.featured')}</Badge>}
                          {product.bestSeller && <Badge variant="success">{t('admin.bestSeller')}</Badge>}
                          {product.newArrival && <Badge variant="secondary">{t('admin.new')}</Badge>}
                          {!product.active && <Badge variant="error">{t('admin.inactive')}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-start sm:text-end">
                      <p className="font-semibold">
                        {product.salePrice ? (
                          <>
                            <span className="line-through text-gray-400 text-sm me-2">
                              EGP {product.price.toLocaleString()}
                            </span>
                            EGP {product.salePrice.toLocaleString()}
                          </>
                        ) : (
                          `EGP ${product.price.toLocaleString()}`
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.variants.length} variants
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${product.id}?id=${product.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  active: boolean
  _count: { products: number }
}

export default function AdminCategoriesPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })

  useEffect(() => {
    fetchCategories()
    const adminName = localStorage.getItem('adminName') || 'Admin'
    const adminEmail = localStorage.getItem('adminEmail') || 'admin@uniquestudios.com'
    setCurrentAdmin({ name: adminName, email: adminEmail })
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
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
            <h1 className="text-2xl md:text-3xl font-bold">{t('admin.categories')}</h1>
            <p className="text-gray-600">{t('admin.manageCategories')}</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 me-2" />
            {t('admin.addCategory')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.allCategories')} ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('admin.noCategories')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.slug}</p>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-sm text-gray-600">
                        {category._count.products} products
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          category.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.active ? t('admin.active') : t('admin.inactive')}
                      </span>
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

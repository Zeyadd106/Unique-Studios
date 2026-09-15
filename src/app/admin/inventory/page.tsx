'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

interface InventoryItem {
  id: string
  productId: string
  productName: string
  size: string
  color: string
  stock: number
  weightMin: number | null
  weightMax: number | null
}

export default function AdminInventoryPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })

  useEffect(() => {
    fetchInventory()
    const adminName = localStorage.getItem('adminName') || 'Admin'
    const adminEmail = localStorage.getItem('adminEmail') || 'admin@uniquestudios.com'
    setCurrentAdmin({ name: adminName, email: adminEmail })
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const products = await response.json()
        const inventoryItems: InventoryItem[] = []

        ;(Array.isArray(products) ? products : []).forEach((product: any) => {
          product.variants.forEach((variant: any) => {
            inventoryItems.push({
              id: variant.id,
              productId: product.id,
              productName: product.name,
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
              weightMin: variant.weightMin,
              weightMax: variant.weightMax,
            })
          })
        })

        setInventory(inventoryItems.sort((a, b) => a.stock - b.stock))
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const lowStockItems = inventory.filter((item) => item.stock <= 5)
  const outOfStockItems = inventory.filter((item) => item.stock === 0)

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
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">{t('admin.inventory')}</h1>
          <p className="text-gray-600">{t('admin.manageInventory')}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('admin.totalVariants')}</p>
                  <p className="text-2xl font-bold">{inventory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('admin.lowStock')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('admin.outOfStock')}</p>
                  <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center">
                <AlertTriangle className="h-5 w-5 me-2" />
                {t('admin.lowStockAlert')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span>
                      {item.productName} - {item.size} / {item.color}
                    </span>
                    <Badge variant={item.stock === 0 ? 'error' : 'warning'}>
                      {item.stock === 0
                        ? t('admin.outOfStock')
                        : `${item.stock} ${t('admin.left')}`}
                    </Badge>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <p className="text-sm text-gray-600">
                    +{lowStockItems.length - 5} {t('admin.moreLowStock')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Inventory List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.allInventory')} ({inventory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    item.stock === 0
                      ? 'border-red-200 bg-red-50'
                      : item.stock <= 5
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200'
                  }`}
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      {item.size} / {item.color}
                      {item.weightMin && item.weightMax && (
                        <span className="ms-2">
                          ({item.weightMin}-{item.weightMax} kg)
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.stock === 0 ? 'error' : item.stock <= 5 ? 'warning' : 'success'
                    }
                  >
                    {item.stock === 0
                      ? t('admin.outOfStock')
                      : `${item.stock} ${t('admin.inStock')}`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

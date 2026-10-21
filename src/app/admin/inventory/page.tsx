'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useState, useEffect } from 'react'
import { AlertTriangle, Save, X, Loader2, Edit2, Filter, Package, PackageX } from 'lucide-react'

interface InventoryItem {
  id: string
  productId: string
  productName: string
  size: string
  color: string
  stock: number
  available: boolean
  weightMin: number | null
  weightMax: number | null
}

interface EditingState {
  variantId: string
  stock: string
  available: boolean
}

type FilterMode = 'in-stock' | 'out-of-stock'

export default function AdminInventoryPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [filterMode, setFilterMode] = useState<FilterMode>('in-stock')

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data: unknown = await response.json()
        const products: {
          id: string
          name: string
          variants: {
            id: string
            size: string
            color: string
            stock: number
            available: boolean
            weightMin: number | null
            weightMax: number | null
          }[]
        }[] = Array.isArray(data) ? data : []
        const inventoryItems: InventoryItem[] = []

        products.forEach((product) => {
          product.variants.forEach((variant) => {
            inventoryItems.push({
              id: variant.id,
              productId: product.id,
              productName: product.name,
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
              available: variant.available,
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory()
      const adminName = localStorage.getItem('adminName') || 'Admin'
      const adminEmail = localStorage.getItem('adminEmail') || 'admin@uniquestudios.com'
      setCurrentAdmin({ name: adminName, email: adminEmail })
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const inStockItems = inventory.filter((item) => item.available && item.stock > 0)
  const lowStockItems = inventory.filter((item) => item.available && item.stock > 0 && item.stock <= 5)
  const outOfStockItems = inventory.filter((item) => !item.available || item.stock === 0)

  const filteredItems = filterMode === 'in-stock' ? inStockItems : outOfStockItems

  const startEdit = (item: InventoryItem) => {
    setEditing({
      variantId: item.id,
      stock: String(item.stock),
      available: item.available,
    })
    setError('')
  }

  const cancelEdit = () => {
    setEditing(null)
    setError('')
  }

  const saveEdit = async (item: InventoryItem) => {
    if (!editing || editing.variantId !== item.id) return

    const stock = Number(editing.stock)
    if (!Number.isFinite(stock) || stock < 0) {
      setError('Stock must be a valid number')
      return
    }

    setSaving(item.id)
    setError('')

    try {
      const response = await fetch(`/api/admin/variants/${item.id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock,
          available: editing.available,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to update')
      }

      setInventory((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, stock, available: editing.available }
            : i
        )
      )
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return
    setEditing({ ...editing, stock: e.target.value })
  }

  const handleAvailableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return
    setEditing({ ...editing, available: e.target.checked })
  }

  const quickToggle = async (item: InventoryItem) => {
    const newAvailable = !item.available
    const newStock = newAvailable ? (item.stock > 0 ? item.stock : 1) : 0

    setSaving(item.id)
    try {
      const response = await fetch(`/api/admin/variants/${item.id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock, available: newAvailable }),
      })

      if (!response.ok) throw new Error('Failed to toggle')

      setInventory((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, stock: newStock, available: newAvailable } : i
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle')
    } finally {
      setSaving(null)
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t('admin.inventory')}</h1>
            <p className="text-gray-600">{t('admin.manageInventory')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filterMode === 'in-stock' ? 'default' : 'outline'}
              onClick={() => setFilterMode('in-stock')}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              <span>{t('admin.inStock')}</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                {inStockItems.length}
              </span>
            </Button>
            <Button
              variant={filterMode === 'out-of-stock' ? 'default' : 'outline'}
              onClick={() => setFilterMode('out-of-stock')}
              className="flex items-center gap-2"
            >
              <PackageX className="h-4 w-4" />
              <span>{t('admin.outOfStock')}</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                {outOfStockItems.length}
              </span>
            </Button>
          </div>
        </div>

        {/* Summary Card - only Low Stock Alert */}
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
                    <span>{item.productName} - {item.size} / {item.color}</span>
                    <Badge variant="warning">{item.stock} {t('admin.left')}</Badge>
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

        {/* Error Toast */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Inventory List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filterMode === 'in-stock' ? t('admin.inStock') : t('admin.outOfStock')} 
                ({filteredItems.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <PackageX className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {filterMode === 'in-stock' 
                    ? t('admin.noInStockVariants') 
                    : t('admin.noOutOfStockVariants')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => {
                  const isEditing = editing?.variantId === item.id
                  const isOutOfStock = !item.available || item.stock === 0
                  const isLowStock = item.available && item.stock > 0 && item.stock <= 5

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                        isOutOfStock
                          ? 'border-red-200 bg-red-50'
                          : isLowStock
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium truncate">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.size} / {item.color}
                          {item.weightMin && item.weightMax && (
                            <span className="ms-2">({item.weightMin}-{item.weightMax} kg)</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap shrink-0">
                        {isEditing ? (
                          <>
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600 w-20">{t('admin.stock')}</label>
                              <Input
                                type="number"
                                min="0"
                                value={editing.stock}
                                onChange={handleStockChange}
                                className="w-24"
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(item)}
                              />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={editing.available}
                                onChange={handleAvailableChange}
                                className="h-4 w-4 rounded border-gray-300 text-[#111111]"
                              />
                              <span>{t('admin.available')}</span>
                            </label>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(item)}
                                disabled={saving === item.id}
                                className="h-8"
                              >
                                {saving === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEdit}
                                className="h-8 text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <Badge
                              variant={isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success'}
                              className="text-sm px-3 py-1"
                            >
                              {isOutOfStock
                                ? t('admin.outOfStock')
                                : isLowStock
                                ? `${item.stock} ${t('admin.left')}`
                                : `${item.stock} ${t('admin.inStock')}`}
                            </Badge>
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                              <input
                                type="checkbox"
                                checked={item.available}
                                onChange={() => quickToggle(item)}
                                disabled={saving === item.id}
                                className="h-4 w-4 rounded border-gray-300 text-[#111111]"
                              />
                              <span>{t('admin.available')}</span>
                            </label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(item)}
                              className="h-8 px-2"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
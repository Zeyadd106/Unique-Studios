'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useLiveOrders } from '@/hooks/use-live-orders'
import { Bell, X } from 'lucide-react'
import Link from 'next/link'

export default function AdminOrdersPage() {
  const router = useRouter()
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { orders, total, newOrderIds, lastUpdated, unauthorized, dismissNew } =
    useLiveOrders(100, 10000)
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })

  useEffect(() => {
    const adminName = localStorage.getItem('adminName') || 'Admin'
    const adminEmail = localStorage.getItem('adminEmail') || 'admin@uniquestudios.com'
    setCurrentAdmin({ name: adminName, email: adminEmail })
  }, [])

  useEffect(() => {
    if (unauthorized) router.push('/admin/login')
  }, [unauthorized, router])

  const statusColors: Record<string, string> = {
    NEW: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-orange-100 text-orange-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        currentAdmin={currentAdmin}
        locale={locale}
        setLocale={setLocale}
        t={t}
      />

      <main className="flex-1 lg:ms-64 p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">{t('admin.orders')}</h1>
          <p className="text-gray-600">{t('admin.manageOrders')}</p>
          <p className="text-xs text-gray-400 mt-1">
            {t('admin.autoRefresh')}
            {lastUpdated && ` · ${t('admin.lastUpdated')}: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>

        {/* New-order alert */}
        {newOrderIds.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <Bell className="h-5 w-5 animate-pulse" />
              <p className="text-sm font-bold">
                {newOrderIds.length} · {t('admin.newOrdersReceived')}
              </p>
            </div>
            <button
              onClick={dismissNew}
              aria-label={t('common.close')}
              className="p-1 rounded-full hover:bg-yellow-100 text-yellow-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.allOrders')} ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('admin.noOrders')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isNew = newOrderIds.includes(order.id)
                  return (
                    <div
                      key={order.id}
                      className={`border rounded-lg p-6 hover:bg-gray-50 transition-colors ${
                        isNew ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            <Badge className={statusColors[order.status]}>{order.status}</Badge>
                            {isNew && (
                              <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-black">
                                {t('admin.new')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Link href={`/admin/orders/${order.id}?id=${order.id}`}>
                          <Button variant="outline" size="sm">
                            {t('admin.viewDetails')}
                          </Button>
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{t('admin.customer')}</p>
                          <p className="text-sm">{order.customerName}</p>
                          <p className="text-sm text-gray-600">{order.phone}</p>
                          <p className="text-sm text-gray-600">{order.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{t('admin.shipping')}</p>
                          <p className="text-sm">{order.address}</p>
                          <p className="text-sm text-gray-600">{order.city}</p>
                          {order.apartment && (
                            <p className="text-sm text-gray-600">{order.apartment}</p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">{t('admin.items')}</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.productName} - {item.size} / {item.color} × {item.quantity}
                              </span>
                              <span className="font-medium">
                                EGP {item.totalPrice.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                          <span className="font-semibold">{t('admin.total')}</span>
                          <span className="font-bold text-lg">
                            EGP {order.total.toLocaleString()}
                          </span>
                        </div>
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

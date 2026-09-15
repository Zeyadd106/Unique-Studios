'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useLiveStats } from '@/hooks/use-live-orders'
import {
  ShoppingBag,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  Bell,
  X,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const { stats, recentOrders, newOrderIds, lastUpdated, unauthorized, dismissNew } =
    useLiveStats(5, 10000)
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })

  useEffect(() => {
    const adminName = localStorage.getItem('adminName') || 'Admin'
    const adminEmail = localStorage.getItem('adminEmail') || 'admin@uniquestudios.com'
    setCurrentAdmin({ name: adminName, email: adminEmail })
  }, [])

  useEffect(() => {
    if (unauthorized) router.push('/admin/login')
  }, [unauthorized, router])

  const statCards = [
    { title: t('admin.totalOrders'), value: stats?.totalOrders ?? '…', icon: ShoppingBag, color: 'bg-blue-500' },
    { title: t('admin.newOrders'), value: stats?.newOrders ?? '…', icon: Clock, color: 'bg-yellow-500' },
    {
      title: t('admin.revenue'),
      value: stats ? `EGP ${stats.totalRevenue.toLocaleString()}` : '…',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    { title: t('admin.totalProducts'), value: stats?.totalProducts ?? '…', icon: Package, color: 'bg-purple-500' },
    { title: t('admin.lowStock'), value: stats?.lowStockProducts ?? '…', icon: AlertTriangle, color: 'bg-red-500' },
    { title: t('admin.confirmed'), value: stats?.confirmedOrders ?? '…', icon: CheckCircle, color: 'bg-green-600' },
    { title: t('admin.processing'), value: stats?.processingOrders ?? '…', icon: Package, color: 'bg-blue-600' },
    { title: t('admin.shipped'), value: stats?.shippedOrders ?? '…', icon: Truck, color: 'bg-orange-500' },
  ]

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
          <h1 className="text-2xl md:text-3xl font-bold">{t('admin.dashboard')}</h1>
          <p className="text-gray-600">
            {t('admin.welcomeBack')}, {currentAdmin.name}!
          </p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.recentOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">{t('admin.noOrders')}</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => {
                  const isNew = newOrderIds.includes(order.id)
                  return (
                    <div
                      key={order.id}
                      className={`flex items-center justify-between gap-3 p-4 border rounded-lg hover:bg-gray-50 ${
                        isNew ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold truncate">
                              {order.orderNumber}
                              {isNew && (
                                <span className="ms-2 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-black">
                                  {t('admin.new')}
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{order.items.length} items</p>
                            <p>EGP {order.total.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}
                        >
                          {order.status}
                        </span>
                        <span className="text-sm text-gray-500 hidden sm:block">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
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

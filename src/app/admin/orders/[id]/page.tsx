'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  phone: string
  secondaryPhone: string | null
  email: string
  address: string
  city: string
  apartment: string | null
  notes: string | null
  paymentMethod: string
  status: string
  subtotal: number
  total: number
  createdAt: string
  items: {
    id: string
    productName: string
    size: string
    color: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
}

export default function AdminOrderDetailPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })

  const fetchOrder = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    try {
      const response = await fetch(`/api/admin/orders/${id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOrder()
    // Refresh the order every 15s so updates are visible without reload.
    const timer = setInterval(fetchOrder, 15000)
    // Get admin info from localStorage or cookies
    const adminName = localStorage.getItem('adminName') || 'Admin'
    const adminEmail = localStorage.getItem('adminEmail') || 'admin@uniquestudios.com'
    setCurrentAdmin({ name: adminName, email: adminEmail })
    return () => clearInterval(timer)
  }, [fetchOrder])

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        const updatedOrder = await response.json()
        setOrder(updatedOrder)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const statusColors: Record<string, string> = {
    NEW: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-orange-100 text-orange-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  const statusOptions = [
    { value: 'NEW', label: t('order.statusNew') },
    { value: 'CONFIRMED', label: t('order.statusConfirmed') },
    { value: 'PROCESSING', label: t('order.statusProcessing') },
    { value: 'SHIPPED', label: t('order.statusShipped') },
    { value: 'DELIVERED', label: t('order.statusDelivered') },
    { value: 'CANCELLED', label: t('order.statusCancelled') },
  ]

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

  if (!order) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar currentAdmin={currentAdmin} locale={locale} setLocale={setLocale} t={t} />
        <main className="flex-1 lg:ms-64 p-4 md:p-8">
          <p className="text-gray-500">{t('admin.orderNotFound')}</p>
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
            <Link href="/admin/orders" className="text-sm text-gray-600 hover:text-black mb-2 block">
              ← {t('admin.backToOrders')}
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">{order.orderNumber}</h1>
            <p className="text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.orderDetails')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('order.status')}</span>
                    <Badge className={statusColors[order.status]}>{order.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('checkout.paymentMethod')}</span>
                    <span className="font-medium">{order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('cart.subtotal')}</span>
                    <span className="font-medium">EGP {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('cart.total')}</span>
                    <span className="font-bold text-lg">EGP {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.items')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.size} / {item.color} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="font-medium">EGP {item.totalPrice.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">
                          EGP {item.unitPrice.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Info & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.customerInfo')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">{t('checkout.fullName')}</p>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('checkout.phone')}</p>
                    <p className="font-medium">{order.phone}</p>
                    {order.secondaryPhone && (
                      <p className="text-sm text-gray-600">{order.secondaryPhone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('checkout.email')}</p>
                    <p className="font-medium">{order.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.shippingAddress')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">{t('checkout.address')}</p>
                    <p className="font-medium">{order.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('checkout.city')}</p>
                    <p className="font-medium">{order.city}</p>
                  </div>
                  {order.apartment && (
                    <div>
                      <p className="text-sm text-gray-600">{t('checkout.apartment')}</p>
                      <p className="font-medium">{order.apartment}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.updateStatus')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <select
                    id="status"
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                    defaultValue={order.status}
                    key={order.status}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    className="w-full"
                    onClick={() => {
                      const status = (document.getElementById('status') as HTMLSelectElement).value
                      handleStatusUpdate(status)
                    }}
                  >
                    {t('admin.updateStatus')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.additionalNotes')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

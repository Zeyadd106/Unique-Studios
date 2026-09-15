'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useState, useEffect } from 'react'

export default function AdminSettingsPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })

  useEffect(() => {
    const adminName = localStorage.getItem('adminName') || 'Admin'
    const adminEmail = localStorage.getItem('adminEmail') || 'admin@uniquestudios.com'
    setCurrentAdmin({ name: adminName, email: adminEmail })
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentAdmin={currentAdmin} locale={locale} setLocale={setLocale} t={t} />

      <main className="flex-1 lg:ms-64 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">{t('admin.settings')}</h1>
          <p className="text-gray-600">{t('admin.manageSettings')}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.storeInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('admin.storeInfoDesc')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.paymentSettings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('admin.paymentSettingsDesc')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.shippingSettings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('admin.shippingSettingsDesc')}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

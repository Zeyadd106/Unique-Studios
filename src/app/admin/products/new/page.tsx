'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { ProductForm } from '@/components/admin/product-form'

export default function NewProductPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })

  useEffect(() => {
    setCurrentAdmin({
      name: localStorage.getItem('adminName') || 'Admin',
      email: localStorage.getItem('adminEmail') || 'admin@uniquestudios.com',
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentAdmin={currentAdmin} locale={locale} setLocale={setLocale} t={t} />
      <main className="flex-1 lg:ms-64 p-4 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t('admin.createProduct')}</h1>
            <p className="text-gray-600">{t('admin.manageProducts')}</p>
          </div>
        </div>
        <ProductForm mode="create" onSuccess={() => window.location.assign('/admin/products')} />
      </main>
    </div>
  )
}

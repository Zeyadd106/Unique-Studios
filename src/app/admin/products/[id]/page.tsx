'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { ProductForm } from '@/components/admin/product-form'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const router = useRouter()
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })
  const [product, setProduct] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentAdmin({
        name: localStorage.getItem('adminName') || 'Admin',
        email: localStorage.getItem('adminEmail') || 'admin@uniquestudios.com',
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { id } = await params
        const res = await fetch(`/api/admin/products/${id}`)
        if (!res.ok) throw new Error('Product not found')
        const data = await res.json()
        if (!cancelled) setProduct(data)
      } catch (err) {
        console.error('Failed to load product', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [params])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar currentAdmin={currentAdmin} locale={locale} setLocale={setLocale} t={t} />
        <main className="flex-1 lg:ms-64 p-4 md:p-8">
          <p className="text-gray-600">{t('admin.loading')}</p>
        </main>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar currentAdmin={currentAdmin} locale={locale} setLocale={setLocale} t={t} />
        <main className="flex-1 lg:ms-64 p-4 md:p-8">
          <p className="text-gray-600">{t('admin.productNotFound') ?? 'Product not found'}</p>
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
            <h1 className="text-2xl md:text-3xl font-bold">{t('admin.editProduct')}</h1>
            <p className="text-gray-600">{product.name}</p>
          </div>
        </div>
        <ProductForm
          mode="edit"
          productId={product.id}
          initialProduct={product}
          onSuccess={() => router.push('/admin/products')}
        />
      </main>
    </div>
  )
}

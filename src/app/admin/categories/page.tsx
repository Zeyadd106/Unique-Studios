'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Edit, Trash2 } from 'lucide-react'

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
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    active: true,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      const run = async () => {
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
      run()
      const adminName = localStorage.getItem('adminName') || 'Admin'
      const adminEmail = localStorage.getItem('adminEmail') || 'admin@uniquestudios.com'
      setCurrentAdmin({ name: adminName, email: adminEmail })
    }, 0)
    return () => clearTimeout(timer)
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const isEdit = !!editingCategory
    const url = isEdit ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories'
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || (isEdit ? 'Failed to update category' : 'Failed to create category'))
      }

      if (isEdit) setIsEditOpen(false)
      else setIsCreateOpen(false)

      setFormData({ name: '', slug: '', description: '', active: true })
      setEditingCategory(null)
      setError('')
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? 'Failed to update category' : 'Failed to create category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    setFormData(prev => ({ ...prev, slug: value }))
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '', active: true })
    setError('')
    setIsCreateOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      active: category.active,
    })
    setError('')
    setIsEditOpen(true)
  }

  const closeModals = () => {
    setIsCreateOpen(false)
    setIsEditOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '', active: true })
    setError('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchCategories()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
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
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 me-2" />
            {t('admin.addCategory')}
          </Button>
        </div>

        {/* Create/Edit Category Modal */}
        {(isCreateOpen || isEditOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">{editingCategory ? t('admin.editCategory') : t('admin.addCategory')}</h2>
                <button
                  onClick={closeModals}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="name">{t('admin.categoryName')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Crewnecks"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">{t('admin.categorySlug')}</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="e.g. crewnecks"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated from name, URL-friendly</p>
                </div>
                <div>
                  <Label htmlFor="description">{t('admin.categoryDescription')}</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111111] focus:border-transparent"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-[#111111] focus:ring-2 focus:ring-[#111111]"
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                    {t('admin.active')}
                  </Label>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModals}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin me-2" />
                        {editingCategory ? t('admin.updating') : t('admin.creating')}
                      </>
                    ) : (
                      editingCategory ? t('admin.update') : t('admin.create')
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                    <div className="text-end shrink-0 flex items-center gap-2">
                      <p className="text-sm text-gray-600">
                        {category._count.products} products
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          category.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {category.active ? t('admin.active') : t('admin.inactive')}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(category)}
                        className="text-gray-600 hover:text-[#111111]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
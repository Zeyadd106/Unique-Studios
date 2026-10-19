'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocale } from '@/hooks/use-locale'
import { useTranslation } from '@/hooks/use-translation'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, X, Loader2 } from 'lucide-react'

interface Voucher {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  discountType?: 'PERCENTAGE' | 'FIXED'
  discountValue?: number
  value: number
  minOrderAmount: number
  minSubtotal?: number | null
  active: boolean
}

export default function AdminVouchersPage() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState({ name: '', email: '' })
  const [showForm, setShowForm] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [code, setCode] = useState('')
  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState('')
  const [minSubtotal, setMinSubtotal] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const load = async () => {
        try {
          const response = await fetch('/api/admin/vouchers')
          if (response.ok) {
            const data = await response.json()
            setVouchers(Array.isArray(data) ? data : [])
          }
        } catch (error) {
          console.error('Error fetching vouchers:', error)
        } finally {
          setLoading(false)
        }
      }
      load()
      const adminName = localStorage.getItem('adminName') || 'Admin'
      const adminEmail = localStorage.getItem('adminEmail') || 'admin@uniquestudios.com'
      setCurrentAdmin({ name: adminName, email: adminEmail })
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const numericValue = Number(value)
    if (!code.trim() || !Number.isFinite(numericValue) || numericValue <= 0) {
      setFormError(t('errors.required'))
      return
    }
    setSaving(true)
    try {
      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          type,
          value: numericValue,
          minSubtotal: minSubtotal === '' ? null : Number(minSubtotal),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setFormError(data.error || t('common.error'))
        return
      }
      setVouchers((prev) => [data, ...prev])
      setCode('')
      setValue('')
      setMinSubtotal('')
      setShowForm(false)
    } catch (error) {
      console.error('Error creating voucher:', error)
      setFormError(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVoucher) return
    setFormError('')
    const numericValue = Number(value)
    if (!code.trim() || !Number.isFinite(numericValue) || numericValue <= 0) {
      setFormError(t('errors.required'))
      return
    }
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/vouchers/${editingVoucher.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          type,
          value: numericValue,
          minSubtotal: minSubtotal === '' ? null : Number(minSubtotal),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setFormError(data.error || t('common.error'))
        return
      }
      setVouchers((prev) => prev.map((v) => (v.id === data.id ? data : v)))
      setCode('')
      setValue('')
      setMinSubtotal('')
      setIsEditOpen(false)
      setEditingVoucher(null)
    } catch (error) {
      console.error('Error updating voucher:', error)
      setFormError(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (voucher: Voucher) => {
    try {
      const response = await fetch(`/api/admin/vouchers/${voucher.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !voucher.active }),
      })
      if (response.ok) {
        const updated = await response.json()
        setVouchers((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
      }
    } catch (error) {
      console.error('Error updating voucher:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.deleteVoucherConfirm'))) return
    try {
      const response = await fetch(`/api/admin/vouchers/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setVouchers((prev) => prev.filter((v) => v.id !== id))
      }
    } catch (error) {
      console.error('Error deleting voucher:', error)
    }
  }

  const openEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    setCode(voucher.code)
    const dbType = voucher.discountType || voucher.type
    setType(dbType === 'PERCENTAGE' ? 'percent' : 'fixed')
    setValue(String(voucher.discountValue ?? voucher.value))
    setMinSubtotal(voucher.minOrderAmount !== undefined && voucher.minOrderAmount !== null ? String(voucher.minOrderAmount) : '')
    setFormError('')
    setIsEditOpen(true)
  }

  const closeEditModal = () => {
    setIsEditOpen(false)
    setEditingVoucher(null)
    setCode('')
    setValue('')
    setMinSubtotal('')
    setFormError('')
  }

  const describe = (voucher: Voucher) => {
    const dbType = voucher.discountType || voucher.type
    const val = voucher.discountValue ?? voucher.value
    return dbType === 'PERCENTAGE'
      ? `${val}%`
      : `EGP ${val.toLocaleString()}`
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
            <h1 className="text-2xl md:text-3xl font-bold">{t('admin.vouchersTitle')}</h1>
            <p className="text-gray-600">{t('admin.manageVouchers')}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 me-2" />
            {t('admin.addVoucher')}
          </Button>
        </div>

        {/* Edit Voucher Modal */}
        {isEditOpen && editingVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">{t('admin.editVoucher')}</h2>
                <button
                  onClick={closeEditModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleEdit} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {formError}
                  </div>
                )}
                <div>
                  <Label htmlFor="v-code">{t('admin.voucherCode')} *</Label>
                  <Input
                    id="v-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SUMMER20"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="v-type">{t('admin.voucherType')}</Label>
                  <select
                    id="v-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as 'percent' | 'fixed')}
                    className="flex h-11 w-full rounded-md border border-[#E2E2E2] bg-white px-4 py-2"
                    disabled={saving}
                  >
                    <option value="percent">{t('admin.percent')}</option>
                    <option value="fixed">{t('admin.fixedAmount')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="v-value">{t('admin.voucherValue')} *</Label>
                  <Input
                    id="v-value"
                    type="number"
                    min="1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === 'percent' ? '10' : '50'}
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="v-min">{t('admin.minSubtotal')}</Label>
                  <Input
                    id="v-min"
                    type="number"
                    min="0"
                    value={minSubtotal}
                    onChange={(e) => setMinSubtotal(e.target.value)}
                    placeholder="500"
                    disabled={saving}
                  />
                </div>
                {formError && (
                  <p className="text-sm font-semibold text-red-600">{formError}</p>
                )}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditModal}
                    className="flex-1"
                    disabled={saving}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin me-2" />
                        {t('admin.updating')}
                      </>
                    ) : (
                      t('admin.update')
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('admin.addVoucher')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="v-code">{t('admin.voucherCode')} *</Label>
                  <Input
                    id="v-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SUMMER20"
                  />
                </div>
                <div>
                  <Label htmlFor="v-type">{t('admin.voucherType')}</Label>
                  <select
                    id="v-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as 'percent' | 'fixed')}
                    className="flex h-11 w-full rounded-md border border-[#E2E2E2] bg-white px-4 py-2"
                  >
                    <option value="percent">{t('admin.percent')}</option>
                    <option value="fixed">{t('admin.fixedAmount')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="v-value">{t('admin.voucherValue')} *</Label>
                  <Input
                    id="v-value"
                    type="number"
                    min="1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === 'percent' ? '10' : '50'}
                  />
                </div>
                <div>
                  <Label htmlFor="v-min">{t('admin.minSubtotal')}</Label>
                  <Input
                    id="v-min"
                    type="number"
                    min="0"
                    value={minSubtotal}
                    onChange={(e) => setMinSubtotal(e.target.value)}
                    placeholder="500"
                  />
                </div>
                {formError && (
                  <p className="md:col-span-2 text-sm font-semibold text-red-600">{formError}</p>
                )}
                <div className="md:col-span-2">
                  <Button type="submit" disabled={saving}>
                    {t('admin.addVoucher')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.vouchersTitle')} ({vouchers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vouchers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('admin.noVouchers')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="flex items-center justify-between gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <h3 className="font-bold tracking-wide">{voucher.code}</h3>
                      <p className="text-sm text-gray-600">
                        {describe(voucher)}
                        {voucher.minSubtotal !== null && voucher.minSubtotal !== undefined &&
                          ` · min EGP ${voucher.minSubtotal.toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleActive(voucher)}
                        className={`text-xs font-bold px-3 py-1.5 rounded ${
                          voucher.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {voucher.active ? t('admin.active') : t('admin.inactive')}
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(voucher)}
                        className="text-gray-600 hover:text-[#111111]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(voucher.id)}
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

'use client'

import { useState, useCallback, useEffect, useTransition } from 'react'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/use-translation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryOption {
  id: string
  name: string
  slug: string
}

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description is required'),
  price: z.coerce.number().positive('Price must be positive'),
  salePrice: z.coerce.number().nonnegative().optional().nullable(),
  categoryId: z.string().min(1, 'Select a category'),
  material: z.string().optional(),
  fit: z.string().optional(),
  careInstructions: z.string().optional(),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  active: z.boolean().default(true),
})

type ProductFormValues = z.infer<typeof productSchema> & {
  images: {
    url: string
    cardUrl: string
    thumbUrl: string
    alt: string
  }[]
  variants: {
    size: string
    color: string
    stock: number
    weightMin?: number | string | null
    weightMax?: number | string | null
  }[]
}

interface ProductImageLike {
  url: string
  cardUrl?: string | null
  thumbUrl?: string | null
  alt?: string | null
}

interface ProductVariantLike {
  size: string
  color: string
  stock: number
  weightMin?: number | string | null
  weightMax?: number | string | null
}

interface ProductLike {
  id?: string
  name?: string
  slug?: string
  description?: string
  price?: number
  salePrice?: number | null
  categoryId?: string
  material?: string | null
  fit?: string | null
  careInstructions?: string | null
  featured?: boolean | null
  bestSeller?: boolean | null
  newArrival?: boolean | null
  active?: boolean | null
  images?: ProductImageLike[] | null
  variants?: ProductVariantLike[] | null
}

interface CategoryLike {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  mode: 'create' | 'edit'
  productId?: string
  initialProduct?: ProductLike
  onSuccess: () => void
}

export function ProductForm({ mode, productId, initialProduct, onSuccess }: ProductFormProps) {
  const { t } = useTranslation()
  const [isPending] = useTransition()
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const defaultValues: ProductFormValues = {
    name: '',
    slug: '',
    description: '',
    price: 0,
    salePrice: null,
    categoryId: '',
    material: undefined,
    fit: undefined,
    careInstructions: undefined,
    featured: false,
    bestSeller: false,
    newArrival: false,
    active: true,
    images: [],
    variants: [],
  }

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    // Cast resolver to keep the generic aligned with our values type.
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues,
  })

  const { fields: imageFields, append: appendImage, remove: removeImage, move: moveImage, replace: replaceImages } =
    useFieldArray({
      control,
      name: 'images',
    })

  const { fields: variantFields, append: appendVariant, remove: removeVariant, replace: replaceVariants } =
    useFieldArray({
      control,
      name: 'variants',
    })

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data: unknown = await res.json()
      if (Array.isArray(data)) {
        setCategories(
          (data as CategoryLike[]).map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
        )
      }
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }, [])

  const populateProduct = useCallback(
    (product: ProductLike) => {
      setValue('name', product.name ?? '')
      setValue('slug', product.slug ?? '')
      setValue('description', product.description ?? '')
      setValue('price', product.price ?? 0)
      setValue('salePrice', product.salePrice ?? null)
      setValue('categoryId', product.categoryId ?? '')
      setValue('material', product.material ?? '')
      setValue('fit', product.fit ?? '')
      setValue('careInstructions', product.careInstructions ?? '')
      setValue('featured', !!product.featured)
      setValue('bestSeller', !!product.bestSeller)
      setValue('newArrival', !!product.newArrival)
      setValue('active', product.active ?? true)

      const images = (product.images ?? []).map((img) => ({
        url: img.url,
        cardUrl: img.cardUrl ?? img.url,
        thumbUrl: img.thumbUrl ?? img.url,
        alt: img.alt ?? '',
      }))
      replaceImages(images)

      replaceVariants(
        (product.variants ?? []).map((v) => ({
          size: v.size,
          color: v.color,
          stock: v.stock,
          weightMin: v.weightMin ?? null,
          weightMax: v.weightMax ?? null,
        })),
      )
    },
    [setValue, replaceImages, replaceVariants],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories()
      if (mode === 'edit' && initialProduct) {
        populateProduct(initialProduct)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [mode, initialProduct, fetchCategories, populateProduct])

  const onSubmit = async (values: ProductFormValues) => {
    setMessage(null)
    const images = imageFields.map((img) => ({
      url: img.url,
      cardUrl: img.cardUrl || img.url,
      thumbUrl: img.thumbUrl || img.url,
      alt: img.alt || values.name,
    }))
    const variants = variantFields.map((v) => ({
      size: v.size,
      color: v.color,
      stock: parseInt(String(v.stock || 0)),
      weightMin: v.weightMin ? parseFloat(String(v.weightMin)) : null,
      weightMax: v.weightMax ? parseFloat(String(v.weightMax)) : null,
    }))

    const body: Record<string, unknown> = {
      ...values,
      salePrice: values.salePrice || null,
      material: values.material || null,
      fit: values.fit || null,
      careInstructions: values.careInstructions || null,
      images,
      variants,
    }

    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(await res.text())
      } else {
        const res = await fetch(`/api/admin/products/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(await res.text())
      }
      setMessage({ kind: 'success', text: t('admin.productSaved') })
      setTimeout(() => onSuccess(), 800)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null
      setMessage({ kind: 'error', text: message || t('admin.productSaveFailed') })
    }
  }

  const addBlankImage = () => {
    appendImage({ url: '', cardUrl: '', thumbUrl: '', alt: '' })
  }

  const addBlankVariant = () => {
    appendVariant({ size: '', color: '', stock: 0, weightMin: null, weightMax: null })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {mode === 'create' ? t('admin.createProduct') : t('admin.editProduct')}
          </h1>
          <p className="text-[#111111]/60 text-sm">
            {mode === 'create' ? t('admin.manageProducts') : 'Manage product details and image gallery.'}
          </p>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.kind === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-[#111111]/80">
              Product Name
            </label>
            <Input
              {...register('name')}
              placeholder="e.g. Oversized T-Shirt"
              className={cn('bg-[#111111]/5 border-[#111111]/20 focus:border-[#111111]', errors.name && 'border-red-500')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[#111111]/80">
              URL Slug
            </label>
            <Input
              {...register('slug')}
              placeholder="e.g. oversized-t-shirt"
              className={cn('bg-[#111111]/5 border-[#111111]/20 focus:border-[#111111]', errors.slug && 'border-red-500')}
            />
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-[#111111]/80">
              {t('product.description')}
            </label>
            <Textarea
              {...register('description')}
              rows={4}
              className={cn('bg-[#111111]/5 border-[#111111]/20 focus:border-[#111111]', errors.description && 'border-red-500')}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[#111111]/80">
              {t('product.price')}
            </label>
            <div className="relative">
              <Input
                {...register('price')}
                type="number"
                placeholder="0"
                className="pl-8 bg-[#111111]/5 border-[#111111]/20 focus:border-[#111111]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#111111]/40 text-sm">EGP</span>
            </div>
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[#111111]/80">
              {t('product.salePrice')} (optional)
            </label>
            <Input
              {...register('salePrice')}
              type="number"
              placeholder="0"
              className="bg-[#111111]/5 border-[#111111]/20 focus:border-[#111111]"
            />
            {errors.salePrice && <p className="mt-1 text-xs text-red-600">{errors.salePrice.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[#111111]/80">
              Category
            </label>
            <Select
              {...register('categoryId')}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              className="w-full"
            />
            {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-[#111111]/80">Material</label>
            <Input {...register('material')} placeholder="e.g. 100% Cotton" className="bg-[#111111]/5 border-[#111111]/20" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[#111111]/80">Fit</label>
            <Input {...register('fit')} placeholder="e.g. Oversized" className="bg-[#111111]/5 border-[#111111]/20" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-[#111111]/80">Care Instructions</label>
            <Input {...register('careInstructions')} className="bg-[#111111]/5 border-[#111111]/20" />
          </div>
        </div>

        {/* Flags */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {(
            [
              { key: 'featured', label: t('admin.featured') },
              { key: 'bestSeller', label: t('admin.bestSeller') },
              { key: 'newArrival', label: t('admin.new') },
              { key: 'active', label: t('admin.active') },
            ] as const
          ).map((flag) => (
            <div key={flag.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register(flag.key)}
                className="w-4 h-4 rounded border-[#111111]/30 text-[#111111] focus:ring-[#111111] bg-[#111111]/5 checked:bg-[#111111] checked:border-[#111111]"
              />
              <label className="text-sm text-[#111111]/70 cursor-pointer">{flag.label}</label>
            </div>
          ))}
        </div>

        {/* Image Gallery */}
        <section className="border border-[#111111]/10 rounded-xl p-6 bg-[#F3F3F3]/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">{t('admin.productImages') ?? 'Product Images'}</h3>
            <p className="text-xs text-[#111111]/50">First image = primary (shown on cards)</p>
          </div>

          <div className="space-y-3">
            {imageFields.map((field, index) => {
              const isFirst = index === 0
              return (
                <div
                  key={field.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#111111]/10"
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[#F3F3F3]">
                    {field.url ? (
                      <Image
                        src={field.url}
                        alt={field.alt || 'Product'}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#111111]/30 text-[10px]">
                        No image
                      </div>
                    )}
                    {isFirst && (
                      <span className="absolute top-1 start-1 z-10 rounded-full bg-[#111111] text-white text-[10px] px-1.5 py-0.5 font-bold uppercase">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        {...register(`images.${index}.url`)}
                        placeholder="Gallery image URL"
                        className="text-xs bg-[#111111]/5 border-[#111111]/20 p-2"
                      />
                      <Input
                        {...register(`images.${index}.cardUrl`)}
                        placeholder="Card image URL"
                        className="text-xs bg-[#111111]/5 border-[#111111]/20 p-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        {...register(`images.${index}.thumbUrl`)}
                        placeholder="Thumbnail URL"
                        className="text-xs bg-[#111111]/5 border-[#111111]/20 p-2"
                      />
                      <Input
                        {...register(`images.${index}.alt`)}
                        placeholder="Alt text"
                        className="text-xs bg-[#111111]/5 border-[#111111]/20 p-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="p-1.5 hover:bg-[#111111]/10 rounded transition-colors"
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-3 w-3 text-[#111111]/60" />
                      </button>
                    )}
                    {index < imageFields.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="p-1.5 hover:bg-[#111111]/10 rounded transition-colors"
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-3 w-3 text-[#111111]/60" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-1.5 hover:bg-[#111111]/10 rounded text-red-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            })}
            {imageFields.length === 0 && (
              <p className="text-xs text-[#111111]/50 text-center py-4">No images added yet.</p>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBlankImage}
              className="text-xs px-3 py-2"
            >
              <Plus className="h-3 w-3 mr-1.5" /> {t('admin.addImage') ?? 'Add Image'}
            </Button>
          </div>
        </section>

        {/* Variants */}
        <section className="border border-[#111111]/10 rounded-xl p-6 bg-[#F3F3F3]/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Sizes & Colours (Variants)</h3>
            <p className="text-xs text-[#111111]/50">One row per size × colour combination.</p>
          </div>

          <div className="space-y-2">
            {variantFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <Input
                  {...register(`variants.${index}.size`)}
                  placeholder="Size"
                  className="text-xs bg-[#111111]/5 border-[#111111]/20 p-2"
                />
                <Input
                  {...register(`variants.${index}.color`)}
                  placeholder="Colour"
                  className="text-xs bg-[#111111]/5 border-[#111111]/20 p-2"
                />
                <Input
                  {...register(`variants.${index}.stock`)}
                  type="number"
                  placeholder="Stock"
                  className="text-xs bg-[#111111]/5 border-[#111111]/20 p-2"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="p-1.5 hover:bg-[#111111]/10 rounded text-red-600"
                  aria-label="Remove variant"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {variantFields.length === 0 && (
              <p className="text-xs text-[#111111]/50 text-center py-4">No variants added yet.</p>
            )}
          </div>

          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBlankVariant}
              className="text-xs px-3 py-2"
            >
              <Plus className="h-3 w-3 mr-1.5" /> Add Variant
            </Button>
          </div>
        </section>

        <div className="pt-6 flex gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#111111] text-white hover:bg-[#2b2b2b] px-8"
          >
            {isPending ? 'Saving...' : mode === 'create' ? t('admin.addProduct') : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

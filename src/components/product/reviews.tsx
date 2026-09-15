'use client'

import { useEffect, useState } from 'react'
import { Star, Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface Review {
  id: string
  author: string
  rating: number
  comment: string
  photos: string[]
  verified: boolean
  createdAt: string
}

interface Summary {
  average: number
  count: number
  distribution: Record<string, number>
}

interface ReviewsSectionProps {
  productId: string
  locale: string
  t: (key: string) => string
}

function Stars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${className} ${i <= Math.round(value) ? 'fill-black text-black' : 'text-gray-300'}`}
        />
      ))}
    </span>
  )
}

// Compress a user photo in-browser so uploads stay small (max 800px JPEG).
// Returns a data URL, or null if it can't be processed.
function compressPhoto(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const maxDim = 800
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

export function ReviewsSection({ productId, locale, t }: ReviewsSectionProps) {
  void locale
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [author, setAuthor] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [photoError, setPhotoError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [justPosted, setJustPosted] = useState(false)

  const load = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      const data = await res.json()
      if (Array.isArray(data.reviews)) setReviews(data.reviews)
      if (data.summary) setSummary(data.summary)
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const handlePhotos = async (files: FileList | null) => {
    setPhotoError('')
    if (!files) return
    const remaining = 2 - photos.length
    const picked = Array.from(files).slice(0, remaining)
    for (const file of picked) {
      if (!file.type.startsWith('image/')) continue
      const compressed = await compressPhoto(file)
      if (!compressed || compressed.length > 700_000) {
        setPhotoError(t('reviews.photoTooLarge'))
        continue
      }
      setPhotos((prev) => (prev.length < 2 ? [...prev, compressed] : prev))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, author, rating, comment, photos }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setAuthor('')
      setComment('')
      setRating(5)
      setPhotos([])
      setFormOpen(false)
      setJustPosted(true)
      await load()
    } catch {
      setFormError(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-12 md:mt-16 border-t border-[#E2E2E2] pt-8 md:pt-10">
      <h2 className="text-xl md:text-2xl font-extrabold">{t('reviews.title')}</h2>

      {/* Summary */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        {summary && summary.count > 0 ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold">{summary.average}</span>
              <div>
                <Stars value={summary.average} />
                <p className="text-xs text-[#131316]/60">
                  {summary.count} {t('reviews.basedOn')}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[5, 4, 3, 2, 1].map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-[#F3F3F3] px-2.5 py-1 text-xs font-bold"
                >
                  {s}★ {summary.distribution[String(s)] ?? 0}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-[#131316]/60">{t('reviews.noReviews')}</p>
        )}
        <Button
          variant={formOpen ? 'ghost' : 'outline'}
          size="sm"
          className="ms-auto"
          onClick={() => setFormOpen(!formOpen)}
        >
          {formOpen ? t('reviews.hideForm') : t('reviews.showForm')}
        </Button>
      </div>

      {/* Form */}
      {formOpen && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="review-author">{t('reviews.yourName')}</Label>
                  <Input
                    id="review-author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder={t('reviews.namePlaceholder')}
                    required
                    minLength={2}
                    maxLength={30}
                  />
                </div>
                <div>
                  <Label>{t('reviews.yourRating')}</Label>
                  <div className="flex items-center gap-1 pt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        aria-label={`${s} stars`}
                        onClick={() => setRating(s)}
                        className="p-0.5"
                      >
                        <Star
                          className={`h-7 w-7 ${s <= rating ? 'fill-black text-black' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="review-comment">{t('reviews.yourReview')}</Label>
                <Textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('reviews.reviewPlaceholder')}
                  rows={3}
                  required
                  minLength={3}
                  maxLength={500}
                />
              </div>
              <div>
                <Label htmlFor="review-photos">{t('reviews.addPhotos')}</Label>
                <div className="flex items-center gap-3 mt-1">
                  <label
                    htmlFor="review-photos"
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-[#E2E2E2] px-3 py-2 text-sm font-semibold hover:opacity-70"
                  >
                    <Camera className="h-4 w-4" />
                    {t('reviews.addPhotos').split('(')[0]}
                  </label>
                  <input
                    id="review-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotos(e.target.files)}
                  />
                  {photos.map((p, i) => (
                    <div key={i} className="relative h-14 w-14">
                      <img
                        src={p}
                        alt=""
                        className="h-14 w-14 rounded-md object-cover border border-[#E2E2E2]"
                      />
                      <button
                        type="button"
                        aria-label={t('common.remove')}
                        onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -top-2 -end-2 rounded-full bg-black p-0.5 text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                {photoError && <p className="mt-1 text-xs text-red-600">{photoError}</p>}
              </div>
              <Button type="submit" loading={submitting}>
                {submitting ? t('reviews.submitting') : t('reviews.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {justPosted && (
        <p className="mt-4 text-sm font-semibold text-green-700">{t('reviews.thanks')}</p>
      )}

      {/* List */}
      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-md border border-[#E2E2E2] p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                  {review.author.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-bold">{review.author}</p>
                  <p className="text-[11px] text-[#131316]/50">
                    {new Date(review.createdAt).toLocaleDateString()}
                    {review.verified && ` · ${t('reviews.verified')}`}
                  </p>
                </div>
              </div>
              <Stars value={review.rating} />
            </div>
            <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>
            {review.photos.length > 0 && (
              <div className="mt-3 flex gap-2">
                {review.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt=""
                    loading="lazy"
                    className="h-20 w-20 rounded-md border border-[#E2E2E2] object-cover"
                  />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

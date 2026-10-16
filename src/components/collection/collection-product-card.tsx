import Link from 'next/link'
import Image from 'next/image'

interface CollectionProduct {
  id: string
  productId: string
  name: string
  slug: string
  description: string
  image: string | null
  images: Array<{
    id: string
    url: string
    cardUrl?: string | null
    thumbUrl?: string | null
    alt: string | null
    sortOrder: number
    isPrimary: boolean
  }>
  imageCount: number
  price: number
  salePrice: number | null
  available: boolean
  colorName?: string | null
  category: { id: string; name: string; slug: string }
  featured: boolean
}

interface CollectionProductCardProps {
  product: CollectionProduct
  locale: string
}

/**
 * Elegant product card used inside collection chapters.
 *
 * Image-focused, with the secondary image cross-fading in on hover. No color
 * selectors: every variant of a product is browsed through the product page.
 */
export function CollectionProductCard({
  product,
  locale,
}: CollectionProductCardProps) {
  const images = product.images ?? []
  const primaryImage = images.find((i) => i.isPrimary) ?? images[0]
  const secondaryImage = images.length > 1 ? images[1] : null

  const format = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const name = product.colorName
    ? `${product.name} ${product.colorName}`
    : product.name

  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} aria-label={name} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-mist">
          {primaryImage ? (
            <Image
              fill
              src={primaryImage.cardUrl ?? primaryImage.url}
              alt={primaryImage.alt ?? name}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw"
              priority={false}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-ink/40">
              {name}
            </div>
          )}

          {/* Secondary image cross-fades in on hover. */}
          {secondaryImage && (
            <Image
              fill
              src={secondaryImage.cardUrl ?? secondaryImage.url}
              alt={secondaryImage.alt ?? `${name} — alternate view`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw"
              priority={false}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </div>

        <div className="pt-3">
          <h3 className="line-clamp-1 text-sm font-bold leading-snug text-ink">
            {name}
          </h3>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-ink/50">
            {product.category.name}
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {format(product.salePrice ?? product.price)}
            {product.salePrice !== null && product.salePrice !== product.price && (
              <span className="ml-2 text-xs font-normal text-ink/50 line-through">
                {format(product.price)}
              </span>
            )}
          </p>
        </div>
      </Link>
    </article>
  )
}

import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSlug: z.string().optional(),
  image: z.string().optional(),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
})

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  secondaryPhone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  apartment: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

export const reviewSchema = z.object({
  productId: z.string().min(1),
  author: z.string().trim().min(2, 'Name must be at least 2 characters').max(30),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3, 'Review must be at least 3 characters').max(500),
  // Compressed client-side images (data URLs). Swap for remote URLs when
  // connecting S3/Cloudinary — the shape stays `string[]`.
  photos: z
    .array(
      z
        .string()
        .startsWith('data:image/')
        .max(700_000, 'Photo is too large')
    )
    .max(2)
    .optional()
    .default([]),
})

export type ReviewFormData = z.infer<typeof reviewSchema>
import { NextResponse } from 'next/server'
import { checkoutSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber, formatPrice } from '@/lib/utils'

// Initialize Resend client lazily to avoid build-time errors
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY not configured - emails will not be sent')
    return null
  }
  try {
    const { Resend } = require('resend')
    return new Resend(apiKey)
  } catch (e) {
    console.warn('[Resend] Failed to initialize Resend client:', e)
    return null
  }
}

const SYSTEM_SENDER_EMAIL = process.env.SYSTEM_SENDER_EMAIL ?? 'orders@uniquestudios.com'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function POST(request: Request) {
  // --- Step A: Rate Limit Check ---
  let rateLimitResult = null
  try {
    rateLimitResult = await rateLimitMiddleware(request)
  } catch (rateLimitError) {
    console.warn('[RateLimit] Rate limiter failed, continuing without rate limiting:', rateLimitError)
    // Continue without rate limiting if it fails
  }

  if (rateLimitResult && !rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please wait before placing another order.',
        retryAfter: rateLimitResult.headers['Retry-After'],
      },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    )
  }

  try {
    // --- Step B: Validation & Creation ---
    const body = await request.json()

    // Validate checkout data
    const validatedData = checkoutSchema.parse(body)

    const { items, ...customerData } = validatedData

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)

    // Validate voucher if provided
    let voucherCode: string | null = null
    let discountAmount = 0
    const rawCode = (customerData.voucherCode ?? '').trim()
    if (rawCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: rawCode.toUpperCase() },
      })

      if (!voucher || !voucher.active) {
        return NextResponse.json({ error: 'Invalid voucher code' }, { status: 400 })
      }

      const now = new Date()
      if (voucher.startsAt && now < voucher.startsAt) {
        return NextResponse.json({ error: 'Voucher not yet active' }, { status: 400 })
      }
      if (voucher.expiresAt && now > voucher.expiresAt) {
        return NextResponse.json({ error: 'Voucher has expired' }, { status: 400 })
      }
      if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
        return NextResponse.json({ error: 'Voucher usage limit reached' }, { status: 400 })
      }
      if (subtotal < voucher.minOrderAmount) {
        return NextResponse.json(
          { error: `Minimum order amount for this voucher is ${formatPrice(voucher.minOrderAmount)}` },
          { status: 400 }
        )
      }

      voucherCode = voucher.code
      discountAmount = voucher.discountType === 'PERCENTAGE'
        ? Math.floor(subtotal * (voucher.discountValue / 100))
        : voucher.discountValue
    }

    const total = subtotal - discountAmount
    const orderNumber = generateOrderNumber()

    // Create order in database with transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerData.customerName,
          phone: customerData.phone,
          secondaryPhone: customerData.secondaryPhone,
          email: customerData.email,
          address: customerData.address,
          city: customerData.city,
          apartment: customerData.apartment,
          notes: customerData.notes,
          paymentMethod: 'CASH_ON_DELIVERY',
          status: 'NEW',
          subtotal,
          voucherCode,
          discountAmount,
          total,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      })

      // Increment voucher usage count
      if (voucherCode) {
        await tx.voucher.update({
          where: { code: voucherCode },
          data: { usedCount: { increment: 1 } },
        })
      }

      return newOrder
    })

    // --- Step C: Send Confirmation Email ---
    // Fire-and-forget: don't block the response on email delivery
    sendOrderConfirmationEmail(order).catch((emailError) => {
      console.error('[Email] Failed to send order confirmation:', emailError)
    })

    // --- Step E: Response ---
    const responseHeaders: Record<string, string> = rateLimitResult?.headers ? Object.fromEntries(
      Object.entries(rateLimitResult.headers).map(([k, v]) => [k, String(v)])
    ) : {}

    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        orderId: order.id,
        total: order.total,
        status: order.status,
        message: 'Order placed successfully. Confirmation email sent.',
      },
      { status: 201, headers: responseHeaders }
    )
  } catch (error) {
    console.error('Error creating order:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    const responseHeaders = rateLimitResult?.headers ?? {}

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400, headers: responseHeaders }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to create order', 
        details: errorMessage,
        stack: errorStack 
      },
      { status: 500, headers: responseHeaders }
    )
  }
}

/**
 * Send order confirmation email via Resend
 * Wrapped in try/catch to never block order creation
 */
async function sendOrderConfirmationEmail(order: {
  orderNumber: string
  customerName: string
  email: string
  phone: string
  items: { productName: string; size: string; color: string; quantity: number; unitPrice: number; totalPrice: number }[]
  subtotal: number
  discountAmount: number
  total: number
  city: string
  createdAt: Date
}) {
  const resend = getResendClient()
  if (!resend) {
    console.log('[Email] Skipping - Resend not configured')
    return
  }

  try {
    const trackingUrl = `${BASE_URL}/track?order=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.phone)}`

    // Simple HTML email to avoid React template issues
    const html = generateOrderEmailHtml({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      items: order.items,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      total: order.total,
      city: order.city,
      createdAt: order.createdAt,
      trackingUrl,
    })

    const { data, error } = await resend.emails.send({
      from: SYSTEM_SENDER_EMAIL,
      to: [order.email],
      subject: `Order Confirmation #${order.orderNumber} - Unique Studios`,
      html,
    })

    if (error) {
      console.error('[Resend] API error:', error)
      return
    }

    console.log('[Email] Order confirmation sent:', data?.id, 'to', order.email)
  } catch (err) {
    console.error('[Email] Unexpected error sending confirmation:', err)
  }
}

function generateOrderEmailHtml({ orderNumber, customerName, items, subtotal, discountAmount, total, city, createdAt, trackingUrl }: any) {
  const formatPrice = (price: number) => new Intl.NumberFormat('en-EG', {
    style: 'currency', currency: 'EGP', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(price)

  const formatDate = (date: Date) => new Intl.DateTimeFormat('en-EG', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date(date))

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Unique Studios</title>
</head>
<body style="margin:0;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F9FAFB;color:#1F2937;line-height:1.6;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#F9FAFB;">
    Your Unique Studios order #${orderNumber} has been confirmed. Track your delivery here.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" maxWidth="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);overflow:hidden;">
        <tr>
          <td style="background:#111;padding:32px 24px;text-align:center;">
            <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.02em;color:#fff;">UNIQUE STUDIOS</h1>
            <p style="margin:8px 0 0;font-size:14px;font-weight:500;color:#F3D27A;text-transform:uppercase;letter-spacing:0.1em;">Order Confirmed</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 24px;">
            <p style="margin:0 0 24px;font-size:16px;color:#1F2937;">Hi ${customerName},</p>
            <p style="margin:0 0 24px;font-size:16px;color:#1F2937;">Thank you for your order! We've received your order and it's being prepared for shipment.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center" style="background:#F3F4F6;border-radius:8px;padding:16px 24px;">
                  <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#6B7280;">Order Number</p>
                  <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.02em;color:#111;">${orderNumber}</p>
                  <p style="margin:8px 0 0;font-size:13px;color:#6B7280;">Placed on ${formatDate(createdAt)}</p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
              <thead>
                <tr>
                  <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6B7280;border-bottom:2px solid #111;">Item</th>
                  <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6B7280;border-bottom:2px solid #111;">Qty</th>
                  <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6B7280;border-bottom:2px solid #111;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item: any) => `
                <tr style="border-bottom:1px solid #E5E7EB;">
                  <td style="padding:16px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#1F2937;">${item.productName}</p>
                    <p style="margin:0;font-size:13px;color:#6B7280;">Size: ${item.size} • Color: ${item.color}</p>
                  </td>
                  <td style="padding:16px;text-align:center;font-size:15px;font-weight:500;color:#1F2937;vertical-align:middle;">${item.quantity}</td>
                  <td style="padding:16px;text-align:right;font-size:15px;font-weight:600;color:#1F2937;vertical-align:middle;">${formatPrice(item.totalPrice)}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;background:#F9FAFB;border-radius:8px;overflow:hidden;">
              <tbody>
                <tr>
                  <td style="padding:12px 16px;width:60%;"><p style="margin:0;font-size:14px;color:#6B7280;">Subtotal</p></td>
                  <td style="padding:12px 16px;text-align:right;width:40%;"><p style="margin:0;font-size:14px;font-weight:500;color:#1F2937;">${formatPrice(subtotal)}</p></td>
                </tr>
                ${discountAmount > 0 ? `
                <tr>
                  <td style="padding:12px 16px;"><p style="margin:0;font-size:14px;color:#F3D27A;">Discount</p></td>
                  <td style="padding:12px 16px;text-align:right;"><p style="margin:0;font-size:14px;font-weight:500;color:#F3D27A;">-${formatPrice(discountAmount)}</p></td>
                </tr>` : ''}
                <tr>
                  <td style="padding:16px;border-top:2px solid #111;"><p style="margin:0;font-size:16px;font-weight:600;color:#1F2937;">Total</p></td>
                  <td style="padding:16px;text-align:right;border-top:2px solid #111;"><p style="margin:0;font-size:18px;font-weight:700;color:#111;">${formatPrice(total)}</p></td>
                </tr>
              </tbody>
            </table>
            <p style="margin:0 0 24px;font-size:14px;color:#6B7280;"><strong>Payment:</strong> Cash on Delivery</p>
            <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6B7280;">Shipping To</p>
              <p style="margin:0;font-size:14px;color:#1F2937;">${customerName}<br>${city}</p>
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${trackingUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:16px 32px;border-radius:9999px;font-size:15px;font-weight:600;letter-spacing:0.02em;">Track Your Order</a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#6B7280;text-align:center;">Questions? <a href="mailto:orders@uniquestudios.com" style="color:#111;text-decoration:none;">Contact our support team</a></p>
          </td>
        </tr>
        <tr>
          <td style="background:#F9FAFB;padding:24px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:500;color:#1F2937;">UNIQUE STUDIOS</p>
            <p style="margin:0 0 16px;font-size:12px;color:#6B7280;">Premium Streetwear — Cash on Delivery Across Egypt</p>
            <div style="display:flex;justify-content:center;gap:16px;">
              <a href="https://instagram.com/uniquestudios" style="color:#6B7280;text-decoration:none;font-size:12px;">Instagram</a>
              <a href="https://facebook.com/uniquestudios" style="color:#6B7280;text-decoration:none;font-size:12px;">Facebook</a>
              <a href="https://tiktok.com/@uniquestudios" style="color:#6B7280;text-decoration:none;font-size:12px;">TikTok</a>
            </div>
            <p style="margin:16px 0 0;font-size:11px;color:#9CA3AF;">© ${new Date().getFullYear()} Unique Studios. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr></table>
</body>
</html>
  `
}
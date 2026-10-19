/**
 * Order Confirmation Email Template
 *
 * A clean, responsive React email template for Unique Studios
 * compatible with Resend's React email rendering.
 */

import { formatPrice, formatDate } from '@/lib/utils'

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  items: {
    productName: string
    size: string
    color: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  subtotal: number
  discountAmount: number
  total: number
  city: string
  createdAt: Date
  trackingUrl: string
}

const brandColor = '#111111'
const goldColor = '#F3D27A'
const textColor = '#1F2937'
const mutedColor = '#6B7280'
const bgColor = '#F9FAFB'
const white = '#FFFFFF'
const borderColor = '#E5E7EB'

// Base styles
const baseStyles = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  lineHeight: 1.6,
  color: textColor,
}

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: white,
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
}

const headerStyle: React.CSSProperties = {
  backgroundColor: brandColor,
  padding: '32px 24px',
  textAlign: 'center',
}

const logoStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: white,
}

const taglineStyle: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: '14px',
  fontWeight: 500,
  color: goldColor,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}

const contentStyle: React.CSSProperties = {
  padding: '32px 24px',
}

const greetingStyle: React.CSSProperties = {
  margin: '0 0 24px',
  fontSize: '16px',
  color: textColor,
}

const textStyle: React.CSSProperties = {
  margin: '0 0 24px',
  fontSize: '16px',
  color: textColor,
}

const orderBadgeStyle: React.CSSProperties = {
  backgroundColor: '#F3F4F6',
  borderRadius: '8px',
  padding: '16px 24px',
  marginBottom: '24px',
  textAlign: 'center',
}

const badgeLabelStyle: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: mutedColor,
}

const orderNumberStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: brandColor,
}

const badgeDateStyle: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: '13px',
  color: mutedColor,
}

const itemsTableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
  marginBottom: '24px',
}

const tableHeaderCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: mutedColor,
  borderBottom: `2px solid ${brandColor}`,
}

const tableCellCenterStyle: React.CSSProperties = {
  ...tableHeaderCellStyle,
  textAlign: 'center',
}

const tableCellRightStyle: React.CSSProperties = {
  ...tableHeaderCellStyle,
  textAlign: 'right',
}

const tableRowStyle: React.CSSProperties = {
  borderBottom: `1px solid ${borderColor}`,
}

const tableCellStyle: React.CSSProperties = {
  padding: '16px',
  verticalAlign: 'top',
}

const tableCellCenter: React.CSSProperties = {
  padding: '16px',
  textAlign: 'center',
  verticalAlign: 'middle',
}

const tableCellRight: React.CSSProperties = {
  padding: '16px',
  textAlign: 'right',
  verticalAlign: 'middle',
}

const itemNameStyle: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: '15px',
  fontWeight: 600,
  color: textColor,
}

const itemMetaStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: mutedColor,
}

const itemPriceStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: textColor,
}

const summaryCardStyle: React.CSSProperties = {
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  overflow: 'hidden',
  marginBottom: '24px',
}

const summaryLabelStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: mutedColor,
}

const summaryValueStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'right',
  fontSize: '14px',
  fontWeight: 500,
  color: textColor,
}

const discountLabelStyle: React.CSSProperties = {
  ...summaryLabelStyle,
  color: goldColor,
}

const discountValueStyle: React.CSSProperties = {
  ...summaryValueStyle,
  color: goldColor,
}

const totalRowStyle: React.CSSProperties = {
  borderTop: `2px solid ${brandColor}`,
}

const totalValueStyle: React.CSSProperties = {
  ...summaryValueStyle,
  fontSize: '18px',
  fontWeight: 700,
  color: brandColor,
}

const paymentInfoStyle: React.CSSProperties = {
  margin: '0 0 24px',
  fontSize: '14px',
  color: mutedColor,
}

const addressCardStyle: React.CSSProperties = {
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const addressLabelStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: mutedColor,
}

const addressTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: textColor,
}

const ctaWrapperStyle: React.CSSProperties = {
  textAlign: 'center',
}

const ctaButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: brandColor,
  color: white,
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '9999px',
  fontSize: '15px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  textAlign: 'center',
}

const helpTextStyle: React.CSSProperties = {
  margin: '24px 0 0',
  fontSize: '13px',
  color: mutedColor,
  textAlign: 'center',
}

const linkStyle: React.CSSProperties = {
  color: brandColor,
  textDecoration: 'none',
}

const footerStyle: React.CSSProperties = {
  backgroundColor: '#F9FAFB',
  padding: '24px',
  textAlign: 'center',
  borderTop: `1px solid ${borderColor}`,
}

const footerBrandStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: '13px',
  fontWeight: 500,
  color: textColor,
}

const footerTaglineStyle: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: '12px',
  color: mutedColor,
}

const socialLinksStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '16px',
  marginBottom: '16px',
}

const socialLinkStyle: React.CSSProperties = {
  color: mutedColor,
  textDecoration: 'none',
  fontSize: '12px',
}

const copyrightStyle: React.CSSProperties = {
  margin: '16px 0 0',
  fontSize: '11px',
  color: '#9CA3AF',
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  discountAmount,
  total,
  city,
  createdAt,
  trackingUrl,
}: OrderConfirmationEmailProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation - Unique Studios</title>
      </head>
      <body style={{ margin: 0, padding: '40px 16px', backgroundColor: bgColor, ...baseStyles }}>
        {/* Preheader */}
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden', fontSize: '1px', lineHeight: '1px', color: bgColor }}>
          Your Unique Studios order #{orderNumber} has been confirmed. Track your delivery here.
        </div>

        <div style={containerStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <h1 style={logoStyle}>UNIQUE STUDIOS</h1>
            <p style={taglineStyle}>Order Confirmed</p>
          </div>

          {/* Content */}
          <div style={contentStyle}>
            <p style={greetingStyle}>Hi {customerName},</p>

            <p style={textStyle}>
              Thank you for your order! We've received your order and it's being
              prepared for shipment. You'll receive another notification when
              your order ships.
            </p>

            {/* Order Number Badge */}
            <div style={orderBadgeStyle}>
              <p style={badgeLabelStyle}>Order Number</p>
              <p style={orderNumberStyle}>{orderNumber}</p>
              <p style={badgeDateStyle}>Placed on {formatDate(createdAt)}</p>
            </div>

            {/* Items Table */}
            <table style={itemsTableStyle}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${brandColor}` }}>
                  <th style={tableHeaderCellStyle}>Item</th>
                  <th style={tableCellCenterStyle}>Qty</th>
                  <th style={tableCellRightStyle}>Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} style={tableRowStyle}>
                    <td style={tableCellStyle}>
                      <p style={itemNameStyle}>{item.productName}</p>
                      <p style={itemMetaStyle}>Size: {item.size} • Color: {item.color}</p>
                    </td>
                    <td style={tableCellCenter}>{item.quantity}</td>
                    <td style={tableCellRight}>
                      <p style={itemPriceStyle}>{formatPrice(item.totalPrice)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Order Summary */}
            <div style={summaryCardStyle}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={summaryLabelStyle}>Subtotal</td>
                    <td style={summaryValueStyle}>{formatPrice(subtotal)}</td>
                  </tr>
                  {discountAmount > 0 && (
                    <tr>
                      <td style={discountLabelStyle}>Discount</td>
                      <td style={discountValueStyle}>-{formatPrice(discountAmount)}</td>
                    </tr>
                  )}
                  <tr style={totalRowStyle}>
                    <td style={{ ...summaryLabelStyle, borderTop: `2px solid ${brandColor}` }}>Total</td>
                    <td style={totalValueStyle}>{formatPrice(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={paymentInfoStyle}>
              <strong>Payment:</strong> Cash on Delivery
            </p>

            {/* Shipping Address */}
            <div style={addressCardStyle}>
              <p style={addressLabelStyle}>Shipping To</p>
              <p style={addressTextStyle}>
                {customerName}<br />{city}
              </p>
            </div>

            {/* CTA Button */}
            <div style={ctaWrapperStyle}>
              <a href={trackingUrl} style={ctaButtonStyle}>
                Track Your Order
              </a>
            </div>

            <p style={helpTextStyle}>
              Questions?{' '}
              <a href="mailto:orders@uniquestudios.com" style={linkStyle}>
                Contact our support team
              </a>
            </p>
          </div>

          {/* Footer */}
          <div style={footerStyle}>
            <p style={footerBrandStyle}>UNIQUE STUDIOS</p>
            <p style={footerTaglineStyle}>
              Premium Streetwear — Cash on Delivery Across Egypt
            </p>
            <div style={socialLinksStyle}>
              <a href="https://instagram.com/uniquestudios" style={socialLinkStyle}>Instagram</a>
              <a href="https://facebook.com/uniquestudios" style={socialLinkStyle}>Facebook</a>
              <a href="https://tiktok.com/@uniquestudios" style={socialLinkStyle}>TikTok</a>
            </div>
            <p style={copyrightStyle}>
              © {new Date().getFullYear()} Unique Studios. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
# 📱 Push Notifications Setup Guide

This guide will help you set up instant push notifications for new orders on your admin PWA.

---

## ✅ What's Been Implemented

1. ✅ **Service Worker** (`public/sw.js`) - Handles push notifications in background
2. ✅ **Push Subscription Hook** (`src/hooks/use-push-notification.ts`) - Manages subscription
3. ✅ **Web Push Library** (`src/lib/web-push.ts`) - Sends notifications
4. ✅ **Database Schema** - Added `PushSubscription` model
5. ✅ **API Routes** - Subscribe/Unsubscribe endpoints
6. ✅ **Order Integration** - Triggers notifications on new orders
7. ✅ **Admin Toggle** - Enable/disable notifications in dashboard
8. ✅ **PWA Manifest** - Configured for Home Screen installation
9. ✅ **VAPID Keys** - Generated for authentication

---

## 🔧 Remaining Setup Steps

### Step 1: Unlock Database and Run Migration

The database is currently locked. Close any running dev servers, then:

```powershell
# Stop any running dev servers (Ctrl+C)

# Remove locked database file
rm prisma/dev.db

# Run migration
npx prisma db push
```

Or use Prisma Studio to reset:
```powershell
npm run db:studio
# Then delete the dev.db file in the UI
```

---

### Step 2: Update Environment Variables

Your local `.env` file already has the VAPID keys. For production (Vercel), add these:

**Go to Vercel → Your Project → Settings → Environment Variables**

Add these for **Production**:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDBD6IPJ4aUjguIvefl6FkZVVLN4Cte0iBqnk6P06pIkO7d097uayqHp8udFoAzVJ0SG67eQWCd1OMtHjL5Fe2g
VAPID_PRIVATE_KEY=WwSOzEYt6yja-RAzTyDJhTf_T5ZwMhmm1DSgKYMSctU
```

**Important:** Keep the private key secret - it's only for server-side use.

---

### Step 3: Sync PostgreSQL Schema for Production

```powershell
npm run db:sync-schema
```

Then push to your production database:

```powershell
$env:DATABASE_URL = "your-postgres-url"
npx prisma generate --schema prisma/postgres/schema.prisma
npx prisma db push --schema prisma/postgres/schema.prisma
```

---

### Step 4: Test Locally

1. Start dev server:
```powershell
npm run dev
```

2. Go to: http://localhost:3000/admin/login
3. Login as admin
4. Go to Dashboard
5. Click "Enable Notifications" button
6. Allow browser notification permission
7. Place a test order as customer
8. You should receive a push notification!

---

### Step 5: Deploy to Production

```powershell
vercel --prod
```

After deployment:

1. Open your PWA on mobile: https://unique-studios-psi.vercel.app/admin/dashboard
2. Add to Home Screen (iOS) or Install PWA (Android)
3. Open from Home Screen
4. Go to Dashboard
5. Enable notifications
6. Lock your phone
7. Place a test order from another device
8. You should receive notification even when phone is locked!

---

## 🎯 How It Works

### 1. Admin Subscribes
- Admin clicks "Enable Notifications" in dashboard
- Browser requests permission
- Service worker subscribes to push service
- Subscription saved to database

### 2. Customer Places Order
- Order created in database
- API detects new order
- Fetches all active admin subscriptions
- Sends push notification via web-push library

### 3. Admin Receives Notification
- Push service delivers to device
- Service worker displays notification
- Shows: "🛍️ New Order Received! Order #12345 from John in Cairo - EGP 500"
- Click to view order
- Works even when phone is locked!

---

## 🔑 VAPID Keys

These are the keys generated for your project:

**Public Key:**
```
BDBD6IPJ4aUjguIvefl6FkZVVLN4Cte0iBqnk6P06pIkO7d097uayqHp8udFoAzVJ0SG67eQWCd1OMtHjL5Fe2g
```

**Private Key:**
```
WwSOzEYt6yja-RAzTyDJhTf_T5ZwMhmm1DSgKYMSctU
```

**Keep the private key secure!** It's already in your `.env` file.

---

## 📱 PWA Installation

### iOS (iPhone/iPad)

1. Open Safari on your iPhone
2. Go to: https://unique-studios-psi.vercel.app/admin/dashboard
3. Tap "Share" button (box with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Tap "Add"
6. Now it's an app on your Home Screen!

### Android

1. Open Chrome on your Android
2. Go to: https://unique-studios-psi.vercel.app/admin/dashboard
3. Tap menu (three dots)
4. Tap "Add to Home Screen" or "Install App"
5. Tap "Install"
6. Now it's an app on your Home Screen!

---

## 🔍 Troubleshooting

### Notifications Not Showing?

**Check Browser Permission:**
- Chrome/Edge: Settings → Privacy → Notifications
- Safari: Settings → Safari → Notifications
- Find your site and ensure it's allowed

**Check Service Worker:**
- Open DevTools (F12)
- Go to Application tab
- Check Service Workers section
- Ensure service worker is active

**Check Database:**
- Run: `npm run db:studio`
- Check PushSubscription table
- Ensure subscription is active

### Database Locked Error?

Close all terminal windows and processes using the database, then:
```powershell
rm prisma/dev.db
npx prisma db push
```

### Push Notification Not Received?

**Check Vercel Logs:**
- Go to Vercel → Your project → Deployments
- Click on latest deployment
- View Function Logs
- Look for [Push] log messages

**Check Subscription:**
- Ensure admin subscribed in dashboard
- Check subscription is active in database
- Verify VAPID keys are set in Vercel

---

## 📋 File Changes Summary

**New Files:**
- `public/sw.js` - Service worker for push notifications
- `public/manifest.json` - PWA manifest
- `src/hooks/use-push-notification.ts` - Push notification hook
- `src/lib/web-push.ts` - Web push utilities
- `src/components/admin/push-notification-toggle.tsx` - Admin toggle component
- `src/app/api/push/subscribe/route.ts` - Subscribe endpoint
- `src/app/api/push/unsubscribe/route.ts` - Unsubscribe endpoint

**Modified Files:**
- `prisma/schema.prisma` - Added PushSubscription model
- `src/app/api/orders/route.ts` - Added push notification trigger
- `src/app/admin/dashboard/page.tsx` - Added push notification toggle
- `src/app/layout.tsx` - Added manifest reference
- `.env` - Added VAPID keys
- `.env.example` - Added VAPID keys template

---

## 🎉 Features

✅ Instant notifications for new orders
✅ Works when phone is locked
✅ Works when app is closed
✅ Works when screen is off
✅ Tap notification to view order
✅ Subscribe/unsubscribe easily
✅ Multiple admin support
✅ PWA installable on iOS and Android
✅ Bilingual support in notifications

---

## 🚀 Next Steps

1. Complete database migration (Step 1)
2. Add VAPID keys to Vercel (Step 2)
3. Sync production schema (Step 3)
4. Test locally (Step 4)
5. Deploy (Step 5)
6. Install PWA on mobile
7. Enable notifications
8. Test with real order!

---

Need help? Check the troubleshooting section or let me know!

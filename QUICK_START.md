# 🚀 Quick Start Guide - UNIQUE STUDIOS

This guide helps you run the site locally and deploy to production for both admins and customers.

---

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (for production)
- Git (optional, for deployment)

---

## 🏃 Running Locally (Development)

### Step 1: Install Dependencies

```powershell
npm install
```

### Step 2: Set Up Environment Variables

Copy the example file:

```powershell
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database (SQLite for local dev)
DATABASE_URL="file:./dev.db"

# Session secret (generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
AUTH_SECRET="your-secret-key-here"

# Admin password
ADMIN_PASSWORD="admin123"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Optional: Email (Resend)
# RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"
# SYSTEM_SENDER_EMAIL="orders@uniquestudios.com"

# Optional: Rate limiting (Upstash Redis)
# UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
# UPSTASH_REDIS_REST_TOKEN="xxxxxxxx"
```

### Step 3: Set Up Database

```powershell
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed:full
```

This creates:
- Admin user: `admin@uniquestudios.com` / `admin123`
- Sample categories and products
- Sample vouchers

### Step 4: Start Development Server

```powershell
npm run dev
```

Visit: http://localhost:3000

---

## 👤 For Admins

### Access Admin Panel

1. Go to: `http://localhost:3000/admin/login`
2. Login with:
   - Email: `admin@uniquestudios.com`
   - Password: `admin123` (or your custom password from `.env`)

### Admin Features

**Dashboard** (`/admin/dashboard`)
- View total orders, revenue, and inventory stats
- See recent orders
- Low stock alerts

**Orders** (`/admin/orders`)
- View all orders
- Update order status (NEW → PROCESSING → SHIPPED → DELIVERED)
- View customer details
- Filter by status

**Products** (`/admin/products`)
- Add new products
- Edit existing products
- Manage product images
- Manage size/color variants
- Track stock levels

**Categories** (`/admin/categories`)
- Create product categories
- Edit category details
- Activate/deactivate categories

**Inventory** (`/admin/inventory`)
- View all product variants
- Update stock levels
- See low stock items

**Vouchers** (`/admin/vouchers`)
- Create discount codes
- Set discount type (percentage or fixed)
- Set minimum order amount
- Set usage limits

### Important: Change Admin Password

Before production, change the admin password:

1. Go to `/admin/settings` (if available) or
2. Update in database via Prisma Studio:

```powershell
npm run db:studio
```

3. Find `AdminUser` table and update the password hash

---

## 🛒 For Customers

### Customer Features

**Browsing**
- Home page with featured collections
- Shop page with all products
- Category pages (Crewnecks, Off-Shoulder, Sweatpants)
- Product detail pages with size/color selection
- Search functionality
- Wishlist (saved in localStorage)

**Shopping Cart**
- Add items to cart
- Update quantities
- Remove items
- View subtotal

**Checkout**
- Guest checkout (no account required)
- Cash on delivery payment
- Shipping information
- Voucher code support
- Order confirmation

**Order Tracking**
- Track order by order number and phone
- View order status
- See order details

**Support**
- Contact page
- Size guide
- Returns policy
- FAQ page

**Language**
- English (default)
- Arabic with full RTL support
- Switch language in header

---

## 🚀 Deploying to Production

### Option 1: Automated Deployment (Recommended)

```powershell
npm run deploy
```

This script will:
1. Check prerequisites (Node, Vercel CLI, Git)
2. Ask for your PostgreSQL connection string
3. Generate AUTH_SECRET automatically
4. Create PostgreSQL schema
5. Push schema to database
6. Seed database
7. Build locally
8. Login to Vercel
9. Set environment variables
10. Deploy to production

### Option 2: Manual Deployment

#### Step 1: Get PostgreSQL Database

Choose a provider:
- **Vercel Postgres** (recommended)
- **Neon** (free tier: 512 MB)
- **Supabase** (free tier: 500 MB)

Get your connection string: `postgresql://user:password@host:5432/db?sslmode=require`

#### Step 2: Sync Schema

```powershell
npm run db:sync-schema
```

#### Step 3: Push Schema to Database

```powershell
$env:DATABASE_URL = "your-postgres-url"
npx prisma generate --schema prisma/postgres/schema.prisma
npx prisma db push --schema prisma/postgres/schema.prisma
```

#### Step 4: Seed Database

```powershell
$env:ADMIN_PASSWORD = "your-secure-password"
$env:DATABASE_URL = "your-postgres-url"
npm run db:seed:full
```

#### Step 5: Build Locally

```powershell
npm run build
```

#### Step 6: Deploy to Vercel

```powershell
# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variables
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
vercel env add ADMIN_PASSWORD production
vercel env add NEXT_PUBLIC_SITE_URL production

# Deploy
vercel --prod
```

---

## 🔧 Common Tasks

### View/Edit Database

```powershell
npm run db:studio
```

Opens Prisma Studio to view and edit data directly.

### Reset Database

```powershell
# Delete database file
rm prisma/dev.db

# Re-migrate and seed
npm run db:migrate
npm run db:seed:full
```

### Add New Product

**Option 1: Via Admin Panel (Recommended)**
1. Go to `/admin/products`
2. Click "Add Product"
3. Fill in details
4. Add images and variants
5. Save

**Option 2: Via Database**
1. Open Prisma Studio: `npm run db:studio`
2. Go to Product table
3. Add new product
4. Add variants in ProductVariant table
5. Add images in ProductImage table

### Update Stock

**Option 1: Via Admin Panel**
1. Go to `/admin/inventory`
2. Find the variant
3. Update stock level

**Option 2: Via Database**
1. Open Prisma Studio: `npm run db:studio`
2. Go to ProductVariant table
3. Update stock field

### Test Order Flow

1. Browse products as customer
2. Add items to cart
3. Go to checkout
4. Fill in customer details
5. Place order
6. Check admin panel for new order
7. Update order status

---

## 🔐 Security Checklist

Before going live:

- [ ] Change `ADMIN_PASSWORD` from default
- [ ] Generate strong `AUTH_SECRET` (64+ chars)
- [ ] Enable SSL on database (`?sslmode=require`)
- [ ] Verify `.env` is NOT in git (check `.gitignore`)
- [ ] Set up Upstash Redis for rate limiting (see `UPSTASH_SETUP.md`)
- [ ] Enable Resend for order emails (optional)
- [ ] Test admin panel authentication
- [ ] Test rate limiting

---

## 📊 Optional Enhancements

### Enable Order Confirmation Emails

1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to environment variables:
   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"
   SYSTEM_SENDER_EMAIL="orders@uniquestudios.com"
   ```
4. Redeploy

### Enable Rate Limiting

See `UPSTASH_SETUP.md` for detailed instructions.

### Add Analytics

Add Google Analytics or Vercel Analytics to track visitors and conversions.

---

## 🐛 Troubleshooting

### Build fails with "Prisma client not generated"

```powershell
npm run db:generate
npm run build
```

### Database connection error

Check `DATABASE_URL` in `.env` file. Ensure:
- PostgreSQL is running (for production)
- Connection string is correct
- SSL mode is enabled (`?sslmode=require`)

### Admin login fails

Re-seed database:
```powershell
npm run db:seed:full
```

### Port 3000 already in use

```powershell
# Kill process on port 3000 (Windows)
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

---

## 📞 Support

For issues:
- Check `DEPLOY.md` for deployment issues
- Check `UPSTASH_SETUP.md` for rate limiting
- Check Next.js docs: https://nextjs.org/docs
- Check Prisma docs: https://www.prisma.io/docs

---

## 🎉 You're Ready!

**Local Development:**
```powershell
npm run dev
```

**Production Deployment:**
```powershell
npm run deploy
```

**Admin Panel:** `http://localhost:3000/admin/login`
**Customer Site:** `http://localhost:3000`

# 🚀 Vercel Deployment Guide — UNIQUE STUDIOS

Complete guide to deploy your Next.js e-commerce site to Vercel with PostgreSQL.

---

## ✅ Quick Deploy (One Command)

```powershell
# Interactive: asks for database URL, secrets, etc.
npm run deploy

# Dry run: shows what would happen without deploying
npm run deploy:dry
```

The script will:
1. ✅ Check prerequisites (Node, Vercel CLI, Git)
2. ✅ Create PostgreSQL schema variant
3. ✅ Push schema to your PostgreSQL database
4. ✅ Seed admin user, categories, and products
5. ✅ Build & test locally
6. ✅ Login to Vercel
7. ✅ Link project
8. ✅ Set environment variables
9. ✅ Deploy to production

---

## 📋 Prerequisites

### 1. PostgreSQL Database (Choose One)

| Service | Free Tier | Setup Time | Recommended |
|---------|-----------|------------|-------------|
| **Vercel Postgres** | 256 MB | 30 sec | ⭐ Yes |
| **Neon** | 512 MB | 60 sec | ⭐ Yes |
| **Supabase** | 500 MB | 60 sec | |
| **Railway** | $5 credit | 60 sec | |

**Get connection string:**
- **Vercel Postgres**: Dashboard → Create Database → Copy `DATABASE_URL`
- **Neon**: Dashboard → Create Project → Copy connection string
- **Supabase**: Dashboard → Settings → Database → Copy connection string

Format: `postgresql://user:password@host:5432/dbname?sslmode=require`

### 2. Vercel Account

1. Sign up at [vercel.com](https://vercel.com)
2. Install CLI (script does this automatically):
   ```powershell
   npm install -g vercel
   ```

---

## 🎯 Manual Deploy (Step-by-Step)

If you prefer manual control:

### Step 1: Prepare PostgreSQL Schema

```powershell
# Create postgres schema (script does this automatically)
npm run deploy:dry
```

This creates `prisma/postgres/schema.prisma` with PostgreSQL provider.

### Step 2: Push Schema to Database

```powershell
# Set database URL
$env:DATABASE_URL = "postgresql://user:pass@host:5432/db"

# Generate PostgreSQL client
npx prisma generate --schema prisma/postgres/schema.prisma

# Push schema (creates tables)
npx prisma db push --schema prisma/postgres/schema.prisma
```

### Step 3: Seed Database

```powershell
# Seed admin, categories, products
$env:ADMIN_PASSWORD = "your-secure-password"
$env:DATABASE_URL = "postgresql://user:pass@host:5432/db"
npm run db:seed:full
```

This creates:
- Admin user: `admin@uniquestudios.com` / your password
- 3 categories (Off Shoulder, Sweatpants, Crewneck)
- 10 products with variants & images
- Vouchers (optional)

### Step 4: Build Locally

```powershell
# Test build
npm run build
```

Fix any errors before proceeding.

### Step 5: Deploy to Vercel

```powershell
# Login to Vercel (opens browser)
vercel login

# Link project
vercel link

# Set environment variables
.vercel\project.json  # Note the project ID

# Set env vars in Vercel dashboard or CLI:
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
vercel env add ADMIN_PASSWORD production
vercel env add NEXT_PUBLIC_SITE_URL production

# Deploy
vercel --prod
```

---

## ⚙️ Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `AUTH_SECRET` | Session signing secret (64+ chars) | Random base64 string |
| `ADMIN_PASSWORD` | Admin panel login password | `your-secure-password` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `https://your-app.vercel.app` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `RESEND_API_KEY` | Enable order emails (Resend) | *(disabled)* |
| `SYSTEM_SENDER_EMAIL` | Email sender address | `orders@uniquestudios.com` |
| `UPSTASH_REDIS_REST_URL` | Rate limiting (Upstash) | *(in-memory)* |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting token | *(in-memory)* |

**Generate AUTH_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🔧 Configuration Files

### `vercel.json`
```json
{
  "name": "unique-studios",
  "framework": "nextjs",
  "buildCommand": "prisma generate --schema prisma/postgres/schema.prisma && next build"
}
```

Tells Vercel to:
1. Generate Prisma client with PostgreSQL schema
2. Build Next.js app

### `prisma/postgres/schema.prisma`
PostgreSQL version of your schema (auto-generated from `prisma/schema.prisma`).

**Keep in sync**: When you modify `prisma/schema.prisma`, re-run:
```powershell
npm run deploy:dry  # Regenerates postgres schema
```

### `.env.example`
Template for local development. Copy to `.env` and fill values.

---

## 📦 What Gets Deployed

### Build Process on Vercel

1. **Install dependencies**: `npm install`
2. **Generate Prisma client**: `prisma generate --schema prisma/postgres/schema.prisma`
3. **Build Next.js**: `next build`
4. **Deploy**: Static files + serverless functions

### Serverless Functions (API Routes)

All `/api/*` routes become Vercel serverless functions:
- `/api/auth/login` — Admin authentication
- `/api/admin/*` — Protected admin endpoints
- `/api/products` — Product catalog
- `/api/orders` — Order submission & tracking
- `/api/reviews` — Product reviews
- `/api/vouchers` — Voucher validation

### Static Assets

- Images in `/public` served from CDN
- Static pages pre-rendered at build time

---

## 🐛 Troubleshooting

### Build Fails: "Prisma client not generated"

**Fix**: Ensure `prisma/postgres/schema.prisma` exists:
```powershell
npm run deploy:dry  # Creates schema
```

Then deploy again.

### Database Connection Error

**Error**: `Can't reach database server`

**Fix**:
1. Check `DATABASE_URL` in Vercel dashboard
2. Ensure database allows external connections
3. Verify SSL mode: `?sslmode=require`
4. Check firewall rules (Neon/Supabase: Settings → Connections)

### Admin Login Fails

**Error**: `Invalid credentials`

**Fix**: Re-seed database:
```powershell
$env:DATABASE_URL = "your-vercel-postgres-url"
$env:ADMIN_PASSWORD = "your-password"
npm run db:seed:full
```

### Images Not Loading

**Error**: Product images 404

**Fix**: Ensure images are in `/public/images/products/`:
```powershell
# Check images exist
Get-ChildItem public\images\products -Recurse -File | Measure-Object
```

Vercel serves `/public` statically — no config needed.

### Rate Limiting Not Working

**Symptom**: No rate limiting on API

**Fix**: Add Upstash Redis (optional):
1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy REST URL & Token
4. Add to Vercel env vars:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

Without Upstash, falls back to in-memory rate limiting (per serverless instance, not global).

---

## 🔄 Updating Your Site

### Code Changes

```powershell
# 1. Test locally
npm run dev

# 2. Commit changes
git add .
git commit -m "Update feature"

# 3. Deploy
npm run deploy -DatabaseUrl "your-db-url" -SkipPrompts
```

### Database Schema Changes

```powershell
# 1. Update prisma/schema.prisma

# 2. Push to database
$env:DATABASE_URL = "your-db-url"
npx prisma generate --schema prisma/postgres/schema.prisma
npx prisma db push --schema prisma/postgres/schema.prisma

# 3. Deploy (regenerates client on Vercel)
npm run deploy -DatabaseUrl "your-db-url" -SkipPrompts
```

### Product Data Changes

Use admin panel at `/admin/products` — no redeployment needed.

### Environment Variable Changes

```powershell
# Update in Vercel dashboard, then redeploy
vercel --prod
```

---

## 🌐 Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `uniquestudios.com`
3. Configure DNS:
   - **Option A**: CNAME → `cname.vercel-dns.com`
   - **Option B**: A record → `76.76.21.21`
4. Update `NEXT_PUBLIC_SITE_URL` to new domain
5. Redeploy: `vercel --prod`

---

## 🔐 Security Checklist

Before going live:

- [ ] Change `ADMIN_PASSWORD` from default
- [ ] Generate strong `AUTH_SECRET` (64+ chars random)
- [ ] Enable SSL on database (`?sslmode=require`)
- [ ] Verify all API routes require authentication
- [ ] Check `.env` is NOT committed to git (`.gitignore` handles this)
- [ ] Enable Vercel Analytics (optional): Settings → Analytics

---

## 📊 Monitoring

### Vercel Dashboard

- **Deployments**: View build logs & status
- **Functions**: Monitor API performance
- **Analytics**: Page views, visitors (enable in Settings)
- **Logs**: Real-time function logs (Settings → Logging)

### Database Monitoring

- **Vercel Postgres**: Dashboard → Metrics
- **Neon**: Dashboard → Monitoring
- **Supabase**: Dashboard → Database → Reports

---

## 💰 Cost Estimate

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Vercel** | 100 GB bandwidth | $20/mo (Pro) |
| **Vercel Postgres** | 256 MB | $20/mo (1 GB) |
| **Neon** | 512 MB | $19/mo (2 GB) |
| **Upstash Redis** | 10,000 cmds/day | $10/mo |
| **Resend** | 3,000 emails/mo | $20/mo (50K) |

**Total (Free Tier)**: $0/mo — good for testing & small traffic  
**Total (Production)**: ~$40-70/mo — handles real traffic

---

## 🚀 Performance Tips

1. **Images**: Already optimized with WebP & lazy loading ✅
2. **Caching**: Vercel auto-caches static assets ✅
3. **Database**: Add indexes for frequently queried fields ✅ (already in schema)
4. **Rate Limiting**: Add Upstash Redis for production ⚠️
5. **Emails**: Add Resend for order confirmations ⚠️

---

## 📞 Support

**Vercel**: [vercel.com/support](https://vercel.com/support)  
**Prisma**: [prisma.io/docs](https://www.prisma.io/docs)  
**Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

## ✨ You're Done!

Your site is now live on Vercel with:
- ✅ PostgreSQL database
- ✅ Admin panel
- ✅ Product catalog
- ✅ Order management
- ✅ Bilingual (English/Arabic + RTL)
- ✅ Mobile responsive

**Share your site**: `https://your-app.vercel.app` 🎉

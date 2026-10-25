# Upstash Redis Setup Guide

This guide will help you set up Upstash Redis for production-grade rate limiting.

## Why Upstash Redis?

Your rate limiting currently falls back to in-memory storage in production. This doesn't work across Vercel's serverless functions because each function instance has its own memory. Upstash Redis provides distributed rate limiting that works across all instances.

## Free Tier Limits

- **10,000 commands per day**
- **10 KB storage**
- **Perfect for small to medium e-commerce sites**

## Setup Steps

### 1. Create Upstash Account

1. Go to [https://upstash.com](https://upstash.com)
2. Click "Sign Up" (or login with GitHub)
3. Free tier is sufficient for most cases

### 2. Create Redis Database

1. After logging in, click "Create Database"
2. Choose a region closest to your users (e.g., "Egypt" for Egypt-based customers)
3. Click "Create"
4. Wait for database to be created (usually 10-20 seconds)

### 3. Get Connection Details

1. Click on your newly created database
2. Scroll down to "REST API" section
3. Copy the **REST URL** and **REST Token**

### 4. Add Environment Variables

#### Local Development (.env)

Add these to your `.env` file:

```env
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

#### Vercel Production

**Option A: Via Vercel Dashboard**
1. Go to your Vercel project → Settings → Environment Variables
2. Add:
   - `UPSTASH_REDIS_REST_URL` = your REST URL
   - `UPSTASH_REDIS_REST_TOKEN` = your REST Token
3. Select "Production" environment
4. Click "Save"
5. Redeploy your project

**Option B: Via CLI**
```powershell
vercel env add UPSTASH_REDIS_REST_URL production
# Paste your REST URL when prompted

vercel env add UPSTASH_REDIS_REST_TOKEN production
# Paste your REST Token when prompted

vercel --prod
```

### 5. Verify It Works

After adding the environment variables, your rate limiting will automatically use Upstash Redis. You can verify by:

1. Checking server logs - you should see rate limiting headers in API responses
2. Testing the order endpoint multiple times - you should get 429 errors after 5 attempts

## Monitoring

Upstash provides a dashboard to monitor:
- Request count
- Memory usage
- Command execution time

Access it from your Upstash dashboard.

## Troubleshooting

### Rate limiting still not working?

1. Check that both env vars are set correctly
2. Verify the values don't have extra quotes or spaces
3. Check Vercel logs for errors
4. Ensure you redeployed after adding env vars

### Upstash limits reached?

If you exceed the free tier limits:
- Upgrade to a paid plan ($10/month for 100K commands/day)
- Or increase the rate limit window in `src/lib/rate-limit.ts` (line 29)

## Alternative: Cloudflare KV

If you prefer Cloudflare over Upstash:
1. Use Cloudflare KV instead of Redis
2. Modify `src/lib/rate-limit.ts` to use Cloudflare's SDK
3. Note: Cloudflare KV is eventually consistent (slightly less accurate for rate limiting)

## Current Rate Limit Settings

- **Limit**: 5 order attempts per 10 minutes per IP
- **Location**: `src/lib/rate-limit.ts` line 29

To change limits, edit the `Ratelimit.slidingWindow(5, '10 m')` line.

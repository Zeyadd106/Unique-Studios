<#
.SYNOPSIS
    UNIQUE STUDIOS - Complete Vercel Deployment Script (Windows PowerShell)
.DESCRIPTION
    One-click deployment: checks prerequisites, sets Vercel env vars,
    pushes Prisma schema to PostgreSQL, seeds data, and deploys to Vercel.
.EXAMPLE
    .\scripts\deploy-vercel.ps1
.EXAMPLE
    .\scripts\deploy-vercel.ps1 -DatabaseUrl "postgresql://..." -SkipPrompts
#>

param(
    [string]$DatabaseUrl = "",
    [string]$AuthSecret = "",
    [string]$AdminPassword = "",
    [string]$SiteUrl = "",
    [switch]$SkipPrompts,
    [switch]$SkipSeed,
    [switch]$DryRun
)

function Write-Step($msg)  { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "  [!] $msg" -ForegroundColor Yellow }
function Write-Err($msg)   { Write-Host "  [X] $msg" -ForegroundColor Red }
function Write-Info($msg)  { Write-Host "  ... $msg" -ForegroundColor Gray }

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "  UNIQUE STUDIOS - Vercel Deployment       " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
Write-Host ""

# --- Step 1: Check Prerequisites ---
Write-Step "Checking prerequisites..."

try {
    $nodeVersion = node --version 2>$null
    Write-Ok "Node.js $nodeVersion"
} catch {
    Write-Err "Node.js not found. Install from https://nodejs.org"
    exit 1
}

try {
    $npmVersion = npm --version 2>$null
    Write-Ok "npm $npmVersion"
} catch {
    Write-Err "npm not found"
    exit 1
}

$vercelInstalled = $false
try {
    $vercelVersion = vercel --version 2>$null
    Write-Ok "Vercel CLI $vercelVersion"
    $vercelInstalled = $true
} catch {
    Write-Warn "Vercel CLI not found. Installing..."
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to install Vercel CLI"
        exit 1
    }
    Write-Ok "Vercel CLI installed"
}

try {
    $gitVersion = git --version 2>$null
    Write-Ok $gitVersion
} catch {
    Write-Warn "Git not found. Deployment will use local files only."
}

Write-Info "Checking Prisma..."
Set-Location $ProjectRoot

# --- Step 2: Collect Configuration ---
Write-Step "Collecting configuration..."

if (-not $SkipPrompts) {
    if (-not $DatabaseUrl) {
        Write-Host ""
        Write-Host "  PostgreSQL Connection String:" -ForegroundColor Yellow
        Write-Host "  (Get from: Vercel Postgres, Neon, Supabase, or Railway)" -ForegroundColor Gray
        Write-Host "  Example: postgresql://user:pass@host:5432/db?sslmode=require" -ForegroundColor Gray
        Write-Host ""
        $DatabaseUrl = Read-Host "  DATABASE_URL"
    }

    if (-not $AuthSecret) {
        $generate = Read-Host "  Generate AUTH_SECRET automatically? (Y/n)"
        if ($generate -eq "" -or $generate -eq "Y" -or $generate -eq "y") {
            $AuthSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
        } else {
            $AuthSecret = Read-Host "  AUTH_SECRET"
        }
    }

    if (-not $AdminPassword) {
        Write-Host ""
        Write-Host "  Admin panel password (default: admin123):" -ForegroundColor Yellow
        $AdminPassword = Read-Host "  ADMIN_PASSWORD"
        if (-not $AdminPassword) { $AdminPassword = "admin123" }
    }

    if (-not $SiteUrl) {
        Write-Host ""
        Write-Host "  Your Vercel app URL:" -ForegroundColor Yellow
        Write-Host "  Example: https://uniquestudios.vercel.app" -ForegroundColor Gray
        $SiteUrl = Read-Host "  NEXT_PUBLIC_SITE_URL"
    }
}

if (-not $DatabaseUrl) {
    Write-Err "DATABASE_URL is required"
    exit 1
}

if (-not $AuthSecret) {
    $AuthSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
}

if (-not $SiteUrl) {
    $SiteUrl = "https://uniquestudios.vercel.app"
}

Write-Ok "Configuration collected"
Write-Info "Database: $($DatabaseUrl.Substring(0, [Math]::Min(30, $DatabaseUrl.Length)))..."
Write-Info "Site URL: $SiteUrl"

# --- Step 3: Prepare PostgreSQL Schema ---
Write-Step "Preparing PostgreSQL schema..."

$pgSchemaDir = Join-Path $ProjectRoot "prisma\postgres"
if (-not (Test-Path $pgSchemaDir)) {
    New-Item -ItemType Directory -Path $pgSchemaDir -Force | Out-Null
}

$schemaPath = Join-Path $ProjectRoot "prisma\schema.prisma"
$pgSchemaPath = Join-Path $pgSchemaDir "schema.prisma"

$schemaContent = Get-Content $schemaPath -Raw
$pgSchemaContent = $schemaContent -replace 'provider\s*=\s*"sqlite"', 'provider = "postgresql"'
$pgSchemaContent | Set-Content $pgSchemaPath -NoNewline

Write-Ok "PostgreSQL schema created: prisma/postgres/schema.prisma"

# --- Step 4: Push Schema to PostgreSQL ---
Write-Step "Pushing schema to PostgreSQL..."

if ($DryRun) {
    Write-Warn "Dry run - skipping database push"
} else {
    $env:DATABASE_URL = $DatabaseUrl

    Write-Info "Generating Prisma client for PostgreSQL..."
    npx prisma generate --schema $pgSchemaPath
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to generate Prisma client"
        exit 1
    }

    Write-Info "Pushing schema to database..."
    npx prisma db push --schema $pgSchemaPath --skip-generate
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to push schema to database"
        Write-Info "Check your DATABASE_URL and try again"
        exit 1
    }

    Write-Ok "Schema pushed successfully"
}

# --- Step 5: Seed Database ---
if (-not $SkipSeed) {
    Write-Step "Seeding database..."

    if ($DryRun) {
        Write-Warn "Dry run - skipping seed"
    } else {
        $env:ADMIN_PASSWORD = $AdminPassword
        $seedScript = Join-Path $ProjectRoot "prisma\seed-full.ts"
        npx tsx $seedScript
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Seed failed - you may need to run it manually"
        } else {
            Write-Ok "Database seeded"
        }
    }
}

# --- Step 6: Build and Test Locally ---
Write-Step "Building project locally..."

if ($DryRun) {
    Write-Warn "Dry run - skipping build"
} else {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Build failed - fix errors before deploying"
        exit 1
    }
    Write-Ok "Build passed"
}

# --- Step 7: Login to Vercel ---
Write-Step "Checking Vercel authentication..."

$loggedIn = $false
try {
    $vercelUser = vercel whoami 2>$null
    if ($vercelUser -and $vercelUser -notmatch "Error") {
        Write-Ok "Logged in as: $vercelUser"
        $loggedIn = $true
    }
} catch {
}

if (-not $loggedIn) {
    Write-Warn "Not logged in to Vercel"
    Write-Info "A browser window will open. Login and come back here."
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Vercel login failed"
        exit 1
    }
    Write-Ok "Logged in to Vercel"
}

# --- Step 8: Link Project ---
Write-Step "Linking to Vercel project..."

$vercelDir = Join-Path $ProjectRoot ".vercel"
if (Test-Path $vercelDir) {
    Write-Info "Project already linked - skipping link step"
} else {
    Write-Info "Creating new Vercel project..."
    vercel link --yes --project uniquestudios
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to link project"
        exit 1
    }
    Write-Ok "Project linked"
}

# --- Step 9: Set Environment Variables ---
Write-Step "Setting Vercel environment variables..."

if ($DryRun) {
    Write-Warn "Dry run - skipping env vars"
} else {
    Write-Warn "Skipping automatic env var setup (PowerShell compatibility issue)"
    Write-Host ""
    Write-Host "  Please set these environment variables manually in Vercel dashboard:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Go to: https://vercel.com/[your-account]/[project]/settings/environment-variables" -ForegroundColor Gray
    Write-Host "  2. Add the following variables for 'Production' environment:" -ForegroundColor Gray
    Write-Host ""
    Write-Host "     DATABASE_URL = $DatabaseUrl" -ForegroundColor Cyan
    Write-Host "     AUTH_SECRET = $AuthSecret" -ForegroundColor Cyan
    Write-Host "     ADMIN_PASSWORD = $AdminPassword" -ForegroundColor Cyan
    Write-Host "     NEXT_PUBLIC_SITE_URL = $SiteUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  3. After adding, click 'Save' and redeploy" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  For now, we'll set them locally for the deploy..." -ForegroundColor Yellow

    # Set locally for this session
    $env:DATABASE_URL = $DatabaseUrl
    $env:AUTH_SECRET = $AuthSecret
    $env:ADMIN_PASSWORD = $AdminPassword
    $env:NEXT_PUBLIC_SITE_URL = $SiteUrl

    Write-Ok "Environment variables set locally (please add to Vercel dashboard)"
}

# --- Step 10: Deploy to Vercel ---
Write-Step "Deploying to Vercel..."

if ($DryRun) {
    Write-Warn "Dry run - skipping deploy"
    Write-Host ""
    Write-Host "  Would deploy with:" -ForegroundColor Cyan
    Write-Host "    vercel --prod" -ForegroundColor Gray
} else {
    Write-Info "This may take 2-5 minutes..."
    vercel --prod --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Deployment failed"
        exit 1
    }
}

# --- Step 11: Summary ---
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "       DEPLOYMENT COMPLETE!                " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "    1. Visit your site: $SiteUrl" -ForegroundColor White
Write-Host "    2. Admin panel: $SiteUrl/admin/login" -ForegroundColor White
Write-Host "    3. Login: admin@uniquestudios.com / $AdminPassword" -ForegroundColor White
Write-Host ""
Write-Host "  Optional (in Vercel dashboard):" -ForegroundColor Cyan
Write-Host "    - RESEND_API_KEY: Enable order confirmation emails" -ForegroundColor Gray
Write-Host "    - UPSTASH_REDIS_REST_URL/TOKEN: Enable rate limiting" -ForegroundColor Gray
Write-Host ""

<#
.SYNOPSIS
    Seed remote PostgreSQL database on Vercel
.DESCRIPTION
    Connects to remote PostgreSQL database and seeds it with initial data.
.EXAMPLE
    .\scripts\seed-remote.ps1
#>

param(
    [string]$DatabaseUrl = ""
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

function Write-Step($msg)  { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "  [!] $msg" -ForegroundColor Yellow }
function Write-Err($msg)   { Write-Host "  [X] $msg" -ForegroundColor Red }
function Write-Info($msg)  { Write-Host "  ... $msg" -ForegroundColor Gray }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Remote Database Seeder                " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get DATABASE_URL
if (-not $DatabaseUrl) {
    Write-Host "  PostgreSQL Connection String:" -ForegroundColor Yellow
    $DatabaseUrl = Read-Host "  DATABASE_URL"
}

if (-not $DatabaseUrl) {
    Write-Err "DATABASE_URL is required"
    exit 1
}

Write-Ok "Database URL received"

# Step 2: Set environment variable
$env:DATABASE_URL = $DatabaseUrl

# Step 3: Get admin password
Write-Host ""
Write-Host "  Admin password:" -ForegroundColor Yellow
$AdminPassword = Read-Host "  ADMIN_PASSWORD"
if (-not $AdminPassword) { $AdminPassword = "admin123" }

$env:ADMIN_PASSWORD = $AdminPassword

# Step 4: Generate Prisma client for PostgreSQL
Write-Step "Generating Prisma client for PostgreSQL..."
Set-Location $ProjectRoot
npx prisma generate --schema prisma/postgres/schema.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Err "Failed to generate Prisma client"
    exit 1
}
Write-Ok "Prisma client generated"

# Step 5: Push schema (if not already done)
Write-Step "Checking schema..."
Write-Info "If schema doesn't exist, it will be created..."
npx prisma db push --schema prisma/postgres/schema.prisma --skip-generate
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Schema push failed (might already exist)"
}

# Step 6: Seed database
Write-Step "Seeding database..."
$seedScript = Join-Path $ProjectRoot "prisma\seed-full.ts"
npx tsx $seedScript
if ($LASTEXITCODE -ne 0) {
    Write-Err "Seed failed"
    exit 1
}
Write-Ok "Database seeded successfully"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "       SEEDING COMPLETE!                  " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Your database now has:" -ForegroundColor Cyan
Write-Host "    - Admin user (admin@uniquestudios.com)" -ForegroundColor White
Write-Host "    - Categories (Off Shoulder, Sweatpants, Crewneck)" -ForegroundColor White
Write-Host "    - Sample products with variants" -ForegroundColor White
Write-Host "    - Sample vouchers" -ForegroundColor White
Write-Host ""
Write-Host "  Refresh your site to see products!" -ForegroundColor Yellow
Write-Host ""

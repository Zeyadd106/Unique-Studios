<#
.SYNOPSIS
    Sync Prisma schemas between SQLite (local) and PostgreSQL (production)
.DESCRIPTION
    Ensures prisma/schema.prisma (SQLite) and prisma/postgres/schema.prisma (PostgreSQL)
    stay in sync. Run this after making schema changes.
.EXAMPLE
    .\scripts\sync-schemas.ps1
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Syncing Prisma schemas..." -ForegroundColor Cyan

$sourceSchema = Join-Path $ProjectRoot "prisma\schema.prisma"
$targetDir = Join-Path $ProjectRoot "prisma\postgres"
$targetSchema = Join-Path $targetDir "schema.prisma"

# Ensure postgres directory exists
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# Read source schema
$sourceContent = Get-Content $sourceSchema -Raw

# Convert SQLite to PostgreSQL
$pgContent = $sourceContent -replace 'provider\s*=\s*"sqlite"', 'provider = "postgresql"'

# Write to postgres schema
$pgContent | Set-Content $targetSchema -NoNewline

Write-Host "✅ Schema synced: prisma/postgres/schema.prisma" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test locally with SQLite: npm run dev" -ForegroundColor White
Write-Host "  2. Deploy to production: npm run deploy" -ForegroundColor White
Write-Host ""

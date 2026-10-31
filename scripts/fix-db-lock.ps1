<#
.SYNOPSIS
    Fix SQLite database lock by closing all Node processes
.DESCRIPTION
    This script will attempt to close all Node processes that might be locking the database.
#>

Write-Host "Attempting to close Node processes..." -ForegroundColor Yellow

try {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Node processes closed." -ForegroundColor Green
} catch {
    Write-Host "No Node processes found or couldn't close them." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Now try running:" -ForegroundColor Cyan
Write-Host "  rm prisma/dev.db" -ForegroundColor White
Write-Host "  npx prisma db push" -ForegroundColor White
Write-Host ""

@echo off
title UNIQUE STUDIOS - Vercel Deployment
color 0B
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║        UNIQUE STUDIOS - Vercel Deployment                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Starting deployment script...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\deploy-vercel.ps1"
echo.
echo Press any key to exit...
pause >nul

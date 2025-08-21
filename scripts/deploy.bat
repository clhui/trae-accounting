@echo off
chcp 65001 >nul
echo ========================================
echo           Project Deployment Script
echo ========================================
echo.

echo 1. Building frontend project...
npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo.
echo 2. Building backend project...
cd backend
npm run build
if %errorlevel% neq 0 (
    echo Backend build failed!
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Build completed! Now you can deploy to Vercel:
echo.
echo 1. Deploy frontend: vercel --prod
echo 2. Deploy backend: cd backend ^&^& vercel --prod
echo.
echo For detailed deployment guide, see: DEPLOYMENT_GUIDE.md
echo ========================================
pause
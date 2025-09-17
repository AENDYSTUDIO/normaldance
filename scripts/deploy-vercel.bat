@echo off
echo ========================================
echo NORMALDANCE - Vercel Deployment Script
echo ========================================
echo.

echo Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo Failed to install Vercel CLI
        pause
        exit /b 1
    )
)

echo.
echo Logging in to Vercel...
vercel login
if %errorlevel% neq 0 (
    echo Failed to login to Vercel
    pause
    exit /b 1
)

echo.
echo Deploying to Vercel...
vercel --prod
if %errorlevel% neq 0 (
    echo Deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
pause

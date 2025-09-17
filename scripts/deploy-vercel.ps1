# PowerShell скрипт для развертывания NORMALDANCE на Vercel

param(
    [switch]$SetupEnv,
    [switch]$Help
)

# Colors
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check if Vercel CLI is installed
function Test-VercelCLI {
    Write-Status "Проверка Vercel CLI..."
    try {
        $vercelVersion = vercel --version
        Write-Success "Vercel CLI найден: $vercelVersion"
        return $true
    }
    catch {
        Write-Warning "Vercel CLI не найден. Устанавливаем..."
        try {
            npm install -g vercel
            Write-Success "Vercel CLI установлен"
            return $true
        }
        catch {
            Write-Error "Не удалось установить Vercel CLI"
            return $false
        }
    }
}

# Prepare project for Vercel
function Initialize-VercelProject {
    Write-Status "Подготовка проекта для Vercel..."
    
    # Copy optimized vercel.json
    if (Test-Path "vercel.optimized.json") {
        Copy-Item "vercel.optimized.json" "vercel.json" -Force
        Write-Success "Обновлен vercel.json"
    }
    
    # Copy Vercel-optimized server
    if (Test-Path "server.vercel.ts") {
        Copy-Item "server.vercel.ts" "server.ts" -Force
        Write-Success "Обновлен server.ts для Vercel"
    }
    
    # Ensure .vercelignore exists
    if (-not (Test-Path ".vercelignore")) {
        Write-Warning "Создаем .vercelignore"
        New-Item -ItemType File -Name ".vercelignore" -Force
    }
    
    Write-Success "Проект подготовлен для Vercel"
}

# Login to Vercel
function Connect-Vercel {
    Write-Status "Вход в Vercel..."
    try {
        vercel login
        Write-Success "Вход в Vercel выполнен"
    }
    catch {
        Write-Error "Ошибка входа в Vercel: $_"
        throw
    }
}

# Deploy to Vercel
function Deploy-Vercel {
    Write-Status "Развертывание на Vercel..."
    try {
        vercel --prod
        Write-Success "Развертывание завершено!"
    }
    catch {
        Write-Error "Ошибка развертывания: $_"
        throw
    }
}

# Setup environment variables
function Set-EnvironmentVariables {
    Write-Status "Настройка переменных окружения..."
    
    Write-Host ""
    Write-Host "📋 Необходимые переменные окружения:" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "1. DATABASE_URL - строка подключения к базе данных"
    Write-Host "2. REDIS_URL - строка подключения к Redis"
    Write-Host "3. NEXTAUTH_URL - URL вашего приложения"
    Write-Host "4. NEXTAUTH_SECRET - секретный ключ"
    Write-Host "5. PINATA_API_KEY - API ключ Pinata"
    Write-Host "6. PINATA_SECRET_KEY - секретный ключ Pinata"
    Write-Host "7. SOLANA_RPC_URL - URL Solana RPC"
    Write-Host "8. NDT_PROGRAM_ID - ID программы NDT"
    Write-Host "9. TRACKNFT_PROGRAM_ID - ID программы TrackNFT"
    Write-Host "10. STAKING_PROGRAM_ID - ID программы Staking"
    Write-Host ""
    Write-Host "Для настройки переменных используйте:" -ForegroundColor $Blue
    Write-Host "vercel env add VARIABLE_NAME"
    Write-Host ""
    
    $setupEnv = Read-Host "Хотите настроить переменные сейчас? (y/n)"
    
    if ($setupEnv -eq "y" -or $setupEnv -eq "Y") {
        Write-Status "Настройка переменных окружения..."
        
        try {
            # Basic environment variables
            vercel env add NODE_ENV production
            vercel env add NEXT_TELEMETRY_DISABLED 1
            
            Write-Success "Базовые переменные настроены"
            Write-Warning "Не забудьте настроить остальные переменные в Vercel dashboard"
        }
        catch {
            Write-Warning "Ошибка настройки переменных: $_"
        }
    }
}

# Show deployment info
function Show-DeploymentInfo {
    Write-Success "🎉 NORMALDANCE развернут на Vercel!"
    Write-Host ""
    Write-Host "📊 Информация о развертывании:" -ForegroundColor $Blue
    Write-Host "  🌐 Dashboard: https://vercel.com/dashboard"
    Write-Host "  📝 Документация: https://vercel.com/docs"
    Write-Host ""
    Write-Host "🔧 Полезные команды:" -ForegroundColor $Green
    Write-Host "  vercel ls                    # Список проектов"
    Write-Host "  vercel logs                  # Логи приложения"
    Write-Host "  vercel env ls                # Список переменных"
    Write-Host "  vercel env add VAR_NAME      # Добавить переменную"
    Write-Host "  vercel --prod                # Деплой в продакшен"
    Write-Host ""
    Write-Host "📋 Следующие шаги:" -ForegroundColor $Yellow
    Write-Host "  1. Настройте переменные окружения"
    Write-Host "  2. Подключите внешние сервисы (PlanetScale, Upstash)"
    Write-Host "  3. Настройте Pusher для WebSocket"
    Write-Host "  4. Протестируйте приложение"
    Write-Host ""
    Write-Host "⚠️ Ограничения Vercel:" -ForegroundColor $Red
    Write-Host "  - Нет встроенной базы данных"
    Write-Host "  - Нет встроенного Redis"
    Write-Host "  - Нет Socket.IO (используйте Pusher)"
    Write-Host "  - Ограничение времени выполнения (10 сек)"
}

# Show help
function Show-Help {
    Write-Host "🚀 Vercel Deployment Script for NORMALDANCE" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Использование:" -ForegroundColor $Yellow
    Write-Host "  .\scripts\deploy-vercel.ps1              # Полное развертывание"
    Write-Host "  .\scripts\deploy-vercel.ps1 -SetupEnv     # Только настройка переменных"
    Write-Host "  .\scripts\deploy-vercel.ps1 -Help         # Показать эту справку"
    Write-Host ""
    Write-Host "Примеры:" -ForegroundColor $Green
    Write-Host "  .\scripts\deploy-vercel.ps1"
    Write-Host "  .\scripts\deploy-vercel.ps1 -SetupEnv"
    Write-Host ""
}

# Main function
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Status "🚀 Начинаем развертывание NORMALDANCE на Vercel..."
    Write-Host ""
    
    if (-not (Test-VercelCLI)) {
        Write-Error "Не удалось установить Vercel CLI"
        exit 1
    }
    
    if ($SetupEnv) {
        Set-EnvironmentVariables
        return
    }
    
    Initialize-VercelProject
    Connect-Vercel
    Deploy-Vercel
    Set-EnvironmentVariables
    Show-DeploymentInfo
    
    Write-Success "🎉 Развертывание на Vercel завершено!"
}

# Run main function
Main

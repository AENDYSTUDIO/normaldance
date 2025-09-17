# PowerShell скрипт для полной очистки Cloud.ru и настройки с нуля

param(
    [switch]$Quick,
    [switch]$Confirm
)

# Configuration
$API_KEY = "7d6d24281a43e50068d35d63f7ead515"
$CUSTOMER_ID = "fd8aec7e-aeba-4626-be40-87d9520dc825"
$PROJECT_ID = "ce41b029-e7ce-4100-b3b3-c38272211b05"

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

# Check if Cloud.ru CLI is installed
function Test-CloudCLI {
    Write-Status "Проверка Cloud.ru CLI..."
    try {
        $cloudVersion = cloud --version
        Write-Success "Cloud.ru CLI найден: $cloudVersion"
        return $true
    }
    catch {
        Write-Warning "Cloud.ru CLI не найден. Устанавливаем..."
        try {
            Invoke-WebRequest -Uri "https://cloud.ru/cli/install.ps1" -OutFile "install-cloud-cli.ps1"
            .\install-cloud-cli.ps1
            Write-Success "Cloud.ru CLI установлен"
            return $true
        }
        catch {
            Write-Error "Не удалось установить Cloud.ru CLI"
            return $false
        }
    }
}

# Configure Cloud.ru CLI
function Set-CloudConfig {
    Write-Status "Настройка Cloud.ru CLI..."
    try {
        cloud config set api-key $API_KEY
        cloud config set customer-id $CUSTOMER_ID
        cloud config set project-id $PROJECT_ID
        Write-Success "Cloud.ru CLI настроен"
    }
    catch {
        Write-Error "Ошибка настройки Cloud.ru CLI"
        throw
    }
}

# Quick cleanup (only services and VMs)
function Invoke-QuickCleanup {
    Write-Status "🧹 Быстрая очистка основных ресурсов..."
    
    # Stop all services
    Write-Status "Остановка сервисов..."
    try {
        $services = cloud service list --format json | ConvertFrom-Json
        foreach ($service in $services) {
            if ($service.name) {
                Write-Status "Остановка сервиса: $($service.name)"
                cloud service stop $service.name
            }
        }
    }
    catch {
        Write-Warning "Ошибка остановки сервисов: $_"
    }
    
    # Delete all services
    Write-Status "Удаление сервисов..."
    try {
        $services = cloud service list --format json | ConvertFrom-Json
        foreach ($service in $services) {
            if ($service.name) {
                Write-Status "Удаление сервиса: $($service.name)"
                cloud service delete $service.name --force
            }
        }
    }
    catch {
        Write-Warning "Ошибка удаления сервисов: $_"
    }
    
    # Delete all VMs
    Write-Status "Удаление VM..."
    try {
        $vms = cloud vm list --format json | ConvertFrom-Json
        foreach ($vm in $vms) {
            if ($vm.name) {
                Write-Status "Удаление VM: $($vm.name)"
                cloud vm delete $vm.name --force
            }
        }
    }
    catch {
        Write-Warning "Ошибка удаления VM: $_"
    }
    
    Write-Success "✅ Быстрая очистка завершена"
}

# Full cleanup (all resources)
function Invoke-FullCleanup {
    Write-Status "🧹 Полная очистка Cloud.ru..."
    
    # Stop all services
    Write-Status "Остановка всех сервисов..."
    try {
        $services = cloud service list --format json | ConvertFrom-Json
        foreach ($service in $services) {
            if ($service.name) {
                Write-Status "Остановка сервиса: $($service.name)"
                cloud service stop $service.name
            }
        }
    }
    catch {
        Write-Warning "Ошибка остановки сервисов: $_"
    }
    
    # Delete all services
    Write-Status "Удаление всех сервисов..."
    try {
        $services = cloud service list --format json | ConvertFrom-Json
        foreach ($service in $services) {
            if ($service.name) {
                Write-Status "Удаление сервиса: $($service.name)"
                cloud service delete $service.name --force
            }
        }
    }
    catch {
        Write-Warning "Ошибка удаления сервисов: $_"
    }
    
    # Delete all VMs
    Write-Status "Удаление всех VM..."
    try {
        $vms = cloud vm list --format json | ConvertFrom-Json
        foreach ($vm in $vms) {
            if ($vm.name) {
                Write-Status "Удаление VM: $($vm.name)"
                cloud vm delete $vm.name --force
            }
        }
    }
    catch {
        Write-Warning "Ошибка удаления VM: $_"
    }
    
    # Delete all disks
    Write-Status "Удаление всех дисков..."
    try {
        $disks = cloud disk list --format json | ConvertFrom-Json
        foreach ($disk in $disks) {
            if ($disk.name) {
                Write-Status "Удаление диска: $($disk.name)"
                cloud disk delete $disk.name --force
            }
        }
    }
    catch {
        Write-Warning "Ошибка удаления дисков: $_"
    }
    
    # Delete all networks
    Write-Status "Удаление всех сетей..."
    try {
        $networks = cloud network list --format json | ConvertFrom-Json
        foreach ($network in $networks) {
            if ($network.name) {
                Write-Status "Удаление сети: $($network.name)"
                cloud network delete $network.name --force
            }
        }
    }
    catch {
        Write-Warning "Ошибка удаления сетей: $_"
    }
    
    # Delete all images
    Write-Status "Удаление всех образов..."
    try {
        $images = cloud image list --format json | ConvertFrom-Json
        foreach ($image in $images) {
            if ($image.name) {
                Write-Status "Удаление образа: $($image.name)"
                cloud image delete $image.name --force
            }
        }
    }
    catch {
        Write-Warning "Ошибка удаления образов: $_"
    }
    
    Write-Success "✅ Полная очистка завершена"
}

# Create new project
function New-CloudProject {
    Write-Status "🚀 Создание нового проекта NORMALDANCE..."
    try {
        cloud project create --name "NORMALDANCE" --description "Web3 Music Platform"
        $newProject = cloud project list --format json | ConvertFrom-Json | Where-Object { $_.name -eq "NORMALDANCE" }
        if ($newProject) {
            cloud config set project-id $newProject.id
            Write-Success "✅ Новый проект создан: $($newProject.id)"
        }
    }
    catch {
        Write-Error "Ошибка создания проекта: $_"
        throw
    }
}

# Setup infrastructure
function Set-Infrastructure {
    Write-Status "🏗️ Настройка базовой инфраструктуры..."
    
    try {
        # Create network
        Write-Status "Создание сети..."
        cloud network create --name "normaldance-network" --cidr "10.0.0.0/16"
        
        # Create subnet
        Write-Status "Создание подсети..."
        cloud subnet create --name "normaldance-subnet" --network "normaldance-network" --cidr "10.0.1.0/24"
        
        # Create security group
        Write-Status "Создание группы безопасности..."
        cloud security-group create --name "normaldance-sg" --description "Security group for NORMALDANCE"
        
        # Add security rules
        Write-Status "Добавление правил безопасности..."
        cloud security-group-rule create --security-group "normaldance-sg" --direction ingress --protocol tcp --port 22 --cidr "0.0.0.0/0"
        cloud security-group-rule create --security-group "normaldance-sg" --direction ingress --protocol tcp --port 80 --cidr "0.0.0.0/0"
        cloud security-group-rule create --security-group "normaldance-sg" --direction ingress --protocol tcp --port 443 --cidr "0.0.0.0/0"
        cloud security-group-rule create --security-group "normaldance-sg" --direction ingress --protocol tcp --port 3000 --cidr "0.0.0.0/0"
        cloud security-group-rule create --security-group "normaldance-sg" --direction ingress --protocol tcp --port 3001 --cidr "0.0.0.0/0"
        
        Write-Success "✅ Базовая инфраструктура настроена"
    }
    catch {
        Write-Error "Ошибка настройки инфраструктуры: $_"
        throw
    }
}

# Create services
function New-Services {
    Write-Status "🎵 Создание сервисов NORMALDANCE..."
    
    try {
        # Create PostgreSQL
        Write-Status "Создание PostgreSQL..."
        cloud service create postgresql --name "normaldance-db" --version "15" --cpu 0.5 --memory 512Mi --storage 10Gi --network "normaldance-network" --security-group "normaldance-sg" --backup-enabled --backup-schedule "0 2 * * *"
        
        # Create Redis
        Write-Status "Создание Redis..."
        cloud service create redis --name "normaldance-redis" --version "7" --cpu 0.25 --memory 256Mi --storage 1Gi --network "normaldance-network" --security-group "normaldance-sg"
        
        # Create application
        Write-Status "Создание приложения..."
        cloud service create container --name "normaldance-app" --image "node:20-alpine" --cpu 1 --memory 1Gi --replicas 1 --network "normaldance-network" --security-group "normaldance-sg" --port 3000:3000 --port 3001:3001 --env NODE_ENV=production --env DATABASE_URL="postgresql://user:pass@normaldance-db:5432/normaldance" --env REDIS_URL="redis://normaldance-redis:6379" --env NEXTAUTH_URL="https://normaldance.tk" --env NEXTAUTH_SECRET="your_super_secret_key_change_me"
        
        Write-Success "✅ Сервисы NORMALDANCE созданы"
    }
    catch {
        Write-Error "Ошибка создания сервисов: $_"
        throw
    }
}

# Show final info
function Show-FinalInfo {
    Write-Success "🎉 Настройка Cloud.ru завершена!"
    Write-Host ""
    Write-Host "📊 Информация о проекте:"
    Write-Host "  🌐 Dashboard: https://partners.cloud.ru"
    Write-Host "  🔑 API Key: $API_KEY"
    Write-Host "  📝 Project ID: $(cloud config get project-id)"
    Write-Host ""
    Write-Host "🏗️ Созданная инфраструктура:"
    Write-Host "  🌐 Сеть: normaldance-network"
    Write-Host "  🔒 Группа безопасности: normaldance-sg"
    Write-Host "  🗄️ База данных: normaldance-db"
    Write-Host "  🔴 Redis: normaldance-redis"
    Write-Host "  🎵 Приложение: normaldance-app"
    Write-Host ""
    Write-Host "📋 Следующие шаги:"
    Write-Host "  1. Зарегистрировать домен на Freenom"
    Write-Host "  2. Настроить DNS записи"
    Write-Host "  3. Развернуть код приложения"
    Write-Host "  4. Настроить SSL сертификаты"
    Write-Host ""
    Write-Host "🔧 Полезные команды:"
    Write-Host "  cloud service list          # Список сервисов"
    Write-Host "  cloud service status        # Статус сервисов"
    Write-Host "  cloud logs normaldance-app  # Логи приложения"
    Write-Host "  cloud service scale normaldance-app --replicas 2  # Масштабирование"
}

# Confirm cleanup
function Confirm-Cleanup {
    if (-not $Confirm) {
        Write-Warning "⚠️ ВНИМАНИЕ: Это удалит ВСЕ ресурсы в Cloud.ru!"
        Write-Warning "⚠️ Это действие НЕОБРАТИМО!"
        Write-Host ""
        $confirm = Read-Host "Вы уверены, что хотите продолжить? (yes/no)"
        if ($confirm -ne "yes") {
            Write-Error "Операция отменена пользователем"
            exit 1
        }
    }
}

# Main function
function Main {
    Write-Status "🚀 Начинаем очистку и настройку Cloud.ru с нуля..."
    Write-Host ""
    
    if (-not (Test-CloudCLI)) {
        Write-Error "Не удалось установить Cloud.ru CLI"
        exit 1
    }
    
    Set-CloudConfig
    Confirm-Cleanup
    
    if ($Quick) {
        Invoke-QuickCleanup
    }
    else {
        Invoke-FullCleanup
        New-CloudProject
        Set-Infrastructure
        New-Services
    }
    
    Show-FinalInfo
    Write-Success "🎉 Cloud.ru готов для NORMALDANCE!"
}

# Run main function
Main

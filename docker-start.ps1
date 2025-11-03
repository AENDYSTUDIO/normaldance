# 🐳 NormalDance Docker Startup Script for PowerShell
# This script helps you quickly start the application with Docker

# Colors
$Blue = @{ ForegroundColor = 'Blue' }
$Green = @{ ForegroundColor = 'Green' }
$Yellow = @{ ForegroundColor = 'Yellow' }
$Red = @{ ForegroundColor = 'Red' }

# Helper functions
function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" @Blue
}

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" @Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" @Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" @Red
}

# Check if Docker is installed
function Check-Docker {
    try {
        $version = docker --version
        Print-Success "Docker found: $version"
    }
    catch {
        Print-Error "Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
        exit 1
    }
}

# Check if Docker daemon is running
function Check-DockerDaemon {
    try {
        docker ps | Out-Null
        Print-Success "Docker daemon is running"
    }
    catch {
        Print-Error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    }
}

# Check if Docker Compose is installed
function Check-DockerCompose {
    try {
        $version = docker-compose --version
        Print-Success "Docker Compose found: $version"
    }
    catch {
        Print-Error "Docker Compose is not installed."
        exit 1
    }
}

# Display menu
function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "===============================================" @Blue
    Write-Host "  🐳 NormalDance Docker Options" @Blue
    Write-Host "===============================================" @Blue
    Write-Host ""
    Write-Host "1) Start dev environment (DB + Redis only)"
    Write-Host "2) Start full Docker stack"
    Write-Host "3) Stop all containers"
    Write-Host "4) View logs"
    Write-Host "5) Connect to PostgreSQL"
    Write-Host "6) Connect to Redis"
    Write-Host "7) Clean up (remove volumes)"
    Write-Host "8) Show Docker status"
    Write-Host "9) Exit"
    Write-Host ""
}

# Start dev environment
function Start-Dev {
    Clear-Host
    Print-Info "Starting development environment (PostgreSQL + Redis)..."
    docker-compose -f docker-compose-dev.yml up -d

    Start-Sleep -Seconds 2

    Clear-Host
    Print-Success "Development environment started!"
    Write-Host ""
    Print-Info "PostgreSQL: localhost:5432"
    Print-Info "  - User: normaldance"
    Print-Info "  - Password: password"
    Write-Host ""
    Print-Info "Redis: localhost:6379"
    Write-Host ""
    Print-Info "Next steps:"
    Write-Host "  1. Run: npm install"
    Write-Host "  2. Run: npm run dev"
    Write-Host "  3. Open: http://localhost:3000"
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Start full stack
function Start-Full {
    Clear-Host
    Print-Warning "Building full Docker image. This may take 10-20 minutes..."
    Print-Warning "Please ensure you have at least 8GB free disk space"
    Write-Host ""

    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Print-Info "Cancelled"
        Read-Host "Press Enter to continue"
        return
    }

    Clear-Host
    Print-Info "Building Docker image..."
    docker build -t normaldance:latest .

    if ($LASTEXITCODE -ne 0) {
        Print-Error "Build failed"
        Read-Host "Press Enter to continue"
        return
    }

    Clear-Host
    Print-Success "Image built!"
    Print-Info "Starting full stack..."
    docker-compose up -d

    Start-Sleep -Seconds 3

    Clear-Host
    Print-Success "Full stack started!"
    Write-Host ""
    Print-Info "Application: http://localhost:3000 (check logs for readiness)"
    Print-Info "PostgreSQL: localhost:5432"
    Print-Info "Redis: localhost:6379"
    Write-Host ""
    Print-Info "View logs with: docker-compose logs -f"
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Stop containers
function Stop-Containers {
    Clear-Host
    Print-Info "Stopping all containers..."
    docker-compose down
    Print-Success "All containers stopped"
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# View logs
function View-Logs {
    Clear-Host
    Write-Host ""
    Write-Host "1) All logs"
    Write-Host "2) Application logs only"
    Write-Host "3) PostgreSQL logs only"
    Write-Host "4) Redis logs only"
    Write-Host "5) Back to menu"
    Write-Host ""

    $choice = Read-Host "Choose (1-5)"

    switch ($choice) {
        "1" { docker-compose logs -f --tail=100 }
        "2" { docker-compose logs -f --tail=100 frontend }
        "3" { docker-compose logs -f --tail=100 postgres }
        "4" { docker-compose logs -f --tail=100 redis }
        "5" { return }
        default { Print-Error "Invalid option" }
    }

    Read-Host "Press Enter to continue"
}

# Connect to PostgreSQL
function Connect-Postgres {
    Clear-Host
    Print-Info "Connecting to PostgreSQL..."
    Print-Info "User: normaldance"
    Print-Info "Password: password"
    Print-Info "Type \q to exit"
    Write-Host ""

    $container = docker-compose ps -q postgres
    if ($container) {
        docker exec -it $container psql -U normaldance -d normaldance
    }
    else {
        docker exec -it normaldance-postgres psql -U normaldance -d normaldance
    }

    Read-Host "Press Enter to continue"
}

# Connect to Redis
function Connect-Redis {
    Clear-Host
    Print-Info "Connecting to Redis..."
    Print-Info "Type EXIT to exit"
    Write-Host ""

    $container = docker-compose ps -q redis
    if ($container) {
        docker exec -it $container redis-cli
    }
    else {
        docker exec -it normaldance-redis redis-cli
    }

    Read-Host "Press Enter to continue"
}

# Show Docker status
function Show-Status {
    Clear-Host
    Write-Host ""
    Write-Host "Docker status:" @Blue
    Write-Host ""
    docker ps
    Write-Host ""
    Write-Host "Docker images:" @Blue
    docker images | Select-String "normaldance"
    Write-Host ""
    Write-Host "Docker volumes:" @Blue
    docker volume ls | Select-String "normaldance"
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Clean up
function Cleanup {
    Clear-Host
    Write-Host ""
    Print-Warning "This will remove all volumes and data!"

    $confirm = Read-Host "Are you sure? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Print-Info "Cancelled"
        Read-Host "Press Enter to continue"
        return
    }

    Print-Info "Cleaning up..."
    docker-compose down -v
    Print-Success "Cleanup complete"
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Main loop
function Main {
    Print-Info "NormalDance Docker Setup"

    # Check prerequisites
    Check-Docker
    Check-DockerDaemon
    Check-DockerCompose

    Write-Host ""
    Read-Host "Press Enter to continue to menu"

    while ($true) {
        Show-Menu
        $choice = Read-Host "Choose an option (1-9)"

        switch ($choice) {
            "1" { Start-Dev }
            "2" { Start-Full }
            "3" { Stop-Containers }
            "4" { View-Logs }
            "5" { Connect-Postgres }
            "6" { Connect-Redis }
            "7" { Cleanup }
            "8" { Show-Status }
            "9" {
                Clear-Host
                Print-Info "Goodbye!"
                Write-Host ""
                exit 0
            }
            default {
                Print-Error "Invalid option. Please choose 1-9."
                Read-Host "Press Enter to continue"
            }
        }
    }
}

# Run main function
Main

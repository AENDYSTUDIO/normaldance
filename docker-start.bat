@echo off
REM 🐳 NormalDance Docker Startup Script for Windows
REM This script helps you quickly start the application with Docker

setlocal enabledelayedexpansion

REM Colors (using findstr trick for colored output)
set "BLUE=[94m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM Check if Docker is installed
echo.
echo Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [91m✗ Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop[0m
    pause
    exit /b 1
)
echo [92m✓ Docker found[0m

REM Check if Docker daemon is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [91m✗ Docker daemon is not running. Please start Docker Desktop.[0m
    pause
    exit /b 1
)
echo [92m✓ Docker daemon is running[0m

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [91m✗ Docker Compose is not installed.[0m
    pause
    exit /b 1
)
echo [92m✓ Docker Compose found[0m

:menu
cls
echo.
echo ===============================================
echo  🐳 NormalDance Docker Options
echo ===============================================
echo.
echo 1) Start dev environment (DB + Redis only)
echo 2) Start full Docker stack
echo 3) Stop all containers
echo 4) View logs
echo 5) Connect to PostgreSQL
echo 6) Connect to Redis
echo 7) Clean up (remove volumes)
echo 8) Show Docker status
echo 9) Exit
echo.
set /p choice="Choose an option (1-9): "

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto start_full
if "%choice%"=="3" goto stop_containers
if "%choice%"=="4" goto view_logs
if "%choice%"=="5" goto connect_postgres
if "%choice%"=="6" goto connect_redis
if "%choice%"=="7" goto cleanup
if "%choice%"=="8" goto status
if "%choice%"=="9" goto exit_script
echo [91m✗ Invalid option. Please choose 1-9.[0m
pause
goto menu

:start_dev
cls
echo.
echo Starting development environment (PostgreSQL + Redis)...
docker-compose -f docker-compose-dev.yml up -d
timeout /t 2 /nobreak
cls
echo [92m✓ Development environment started![0m
echo.
echo PostgreSQL: localhost:5432
echo   - User: normaldance
echo   - Password: password
echo.
echo Redis: localhost:6379
echo.
echo Next steps:
echo   1. Run: npm install
echo   2. Run: npm run dev
echo   3. Open: http://localhost:3000
echo.
pause
goto menu

:start_full
cls
echo.
echo [93m⚠ Building full Docker image. This may take 10-20 minutes...[0m
echo [93m⚠ Please ensure you have at least 8GB free disk space[0m
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    goto menu
)

cls
echo Building Docker image...
docker build -t normaldance:latest .
if errorlevel 1 (
    echo [91m✗ Build failed[0m
    pause
    goto menu
)

cls
echo [92m✓ Image built![0m
echo Starting full stack...
docker-compose up -d
timeout /t 3 /nobreak

cls
echo [92m✓ Full stack started![0m
echo.
echo Application: http://localhost:3000 (check logs for readiness)
echo PostgreSQL: localhost:5432
echo Redis: localhost:6379
echo.
echo View logs with: docker-compose logs -f
echo.
pause
goto menu

:stop_containers
cls
echo.
echo Stopping all containers...
docker-compose down
echo [92m✓ All containers stopped[0m
echo.
pause
goto menu

:view_logs
cls
echo.
echo 1) All logs
echo 2) Application logs only
echo 3) PostgreSQL logs only
echo 4) Redis logs only
echo 5) Back to menu
echo.
set /p log_choice="Choose (1-5): "

if "%log_choice%"=="1" docker-compose logs -f --tail=100
if "%log_choice%"=="2" docker-compose logs -f --tail=100 frontend
if "%log_choice%"=="3" docker-compose logs -f --tail=100 postgres
if "%log_choice%"=="4" docker-compose logs -f --tail=100 redis
if "%log_choice%"=="5" goto menu

pause
goto menu

:connect_postgres
cls
echo.
echo Connecting to PostgreSQL...
echo User: normaldance
echo Password: password
echo Type \q to exit
echo.
for /f "tokens=*" %%i in ('docker-compose ps -q postgres') do set container=%%i
if defined container (
    docker exec -it %container% psql -U normaldance -d normaldance
) else (
    docker exec -it normaldance-postgres psql -U normaldance -d normaldance
)
pause
goto menu

:connect_redis
cls
echo.
echo Connecting to Redis...
echo Type EXIT to exit
echo.
for /f "tokens=*" %%i in ('docker-compose ps -q redis') do set container=%%i
if defined container (
    docker exec -it %container% redis-cli
) else (
    docker exec -it normaldance-redis redis-cli
)
pause
goto menu

:cleanup
cls
echo.
echo [93m⚠ This will remove all volumes and data![0m
set /p confirm="Are you sure? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    goto menu
)

echo.
echo Cleaning up...
docker-compose down -v
echo [92m✓ Cleanup complete[0m
echo.
pause
goto menu

:status
cls
echo.
echo Docker status:
echo.
docker ps
echo.
echo Docker images:
docker images | findstr normaldance
echo.
echo Docker volumes:
docker volume ls | findstr normaldance
echo.
pause
goto menu

:exit_script
echo.
echo Goodbye!
echo.
exit /b 0

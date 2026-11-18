@echo off
echo.
echo  ██████╗ ██╗      █████╗  ██████╗███████╗██████╗ ██████╗  ██████╗ 
echo  ██╔══██╗██║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔══██╗██╔═══██╗
echo  ██████╔╝██║     ███████║██║     █████╗  ██████╔╝██████╔╝██║   ██║
echo  ██╔═══╝ ██║     ██╔══██║██║     ██╔══╝  ██╔═══╝ ██╔══██╗██║   ██║
echo  ██║     ███████╗██║  ██║╚██████╗███████╗██║     ██║  ██║╚██████╔╝
echo  ╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ 
echo.
echo  Campus Placement Management System
echo  ====================================
echo.

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Docker is not installed or not running.
    echo  Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo  [1/3] Stopping any previous containers...
docker-compose down >nul 2>&1

echo  [2/3] Building and starting all services...
echo        This may take 3-5 minutes on first run (downloading images + building).
echo.
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Failed to start services. Check docker-compose logs:
    echo  docker-compose logs
    pause
    exit /b 1
)

echo.
echo  [3/3] Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo.
echo  ============================================
echo   PlacePro is RUNNING!
echo  ============================================
echo.
echo   Frontend  -^>  http://localhost:3000
echo   Backend   -^>  http://localhost:8080
echo   Database  -^>  localhost:5432 (placementdb)
echo.
echo   Default login: Register a new account at
echo   http://localhost:3000/register
echo.
echo   To stop:  stop.bat  OR  docker-compose down
echo  ============================================
echo.
pause

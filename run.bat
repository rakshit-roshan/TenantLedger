@echo off
cd /d "%~dp0"
title Gharkhata Launcher

echo ==============================================================================
echo                      GHARKHATA APPLICATION LAUNCHER                           
echo               Multi-Tenant Rent Management Platform for India                 
echo ==============================================================================
echo.

REM 1. Load Environment Variables from .env safely
if exist ".env" (
    echo [*] Loading .env configuration...
    for /f "usebackq tokens=1* delims==" %%A in (`findstr /v "^#" ".env"`) do (
        if not "%%A"=="" set "%%A=%%B"
    )
)

if "%SERVER_PORT%"=="" set SERVER_PORT=8080
if "%FRONTEND_PORT%"=="" set FRONTEND_PORT=5173
if "%SERVER_CONTEXT_PATH%"=="" set SERVER_CONTEXT_PATH=/api/v1
if "%DB_PORT%"=="" set DB_PORT=3306
if "%DB_NAME%"=="" set DB_NAME=gharkhata
if "%DB_HOST%"=="" set DB_HOST=localhost

echo     App Name      : %APP_NAME%
echo     Backend Port  : %SERVER_PORT% [Context: %SERVER_CONTEXT_PATH%]
echo     Frontend Port : %FRONTEND_PORT%
echo     MySQL Database: %DB_HOST%:%DB_PORT%/%DB_NAME%
echo.

REM 2. Stop any existing processes on configured ports
echo [*] Checking and freeing ports %SERVER_PORT% and %FRONTEND_PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%SERVER_PORT% " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%FRONTEND_PORT% " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul

REM 3. Compile Backend if JAR not found
if not exist "backend\target\gharkhata-backend-1.0.0.jar" goto BUILD_BACKEND
goto START_SERVICES

:BUILD_BACKEND
echo [*] Compiling Spring Boot Backend with Maven...
call mvn -f backend/pom.xml clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Maven build failed.
    pause
    exit /b 1
)

:START_SERVICES
REM 4. Check Frontend dependencies
if not exist "frontend\node_modules" (
    echo [*] Installing frontend npm packages...
    call npm --prefix frontend install
)

REM 5. Start Backend Process
echo [*] Starting Spring Boot Backend on port %SERVER_PORT%...
start "Gharkhata Backend" /d "%~dp0backend" cmd /k "title Gharkhata Backend && java -jar target\gharkhata-backend-1.0.0.jar"

REM 6. Start Frontend Process
echo [*] Starting Vite Frontend on port %FRONTEND_PORT%...
start "Gharkhata Frontend" /d "%~dp0frontend" cmd /k "title Gharkhata Frontend && npm run dev"

REM 7. Wait and Open Web Browser
echo.
echo [*] Waiting for services to initialize...
ping 127.0.0.1 -n 6 >nul
echo [*] Opening browser: http://localhost:%FRONTEND_PORT%/
start http://localhost:%FRONTEND_PORT%/

echo.
echo ==============================================================================
echo                      GHARKHATA IS NOW RUNNING!                                
echo ==============================================================================
echo   - Web Application : http://localhost:%FRONTEND_PORT%/
echo   - Backend REST API: http://localhost:%SERVER_PORT%%SERVER_CONTEXT_PATH%
echo.
echo   Press any key below to stop all Gharkhata services and exit...
echo ==============================================================================
pause >nul

echo.
echo [*] Stopping services...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%SERVER_PORT% " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%FRONTEND_PORT% " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul
echo [OK] All services stopped cleanly.
ping 127.0.0.1 -n 3 >nul

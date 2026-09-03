@echo off
echo ==============================================
echo   Iniciando Entorno Pronavid (Docker)
echo ==============================================
echo.

cd /d "%~dp0"

:: Verificar si Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta en ejecucion. Por favor inicia Docker Desktop e intenta nuevamente.
    pause
    exit /b 1
)

echo [1/3] Apagando contenedores activos...
:: docker compose -f docker-compose.db.yml down
docker compose -f docker-compose.backend.yml down
docker compose -f docker-compose.frontend.yml down

echo [2/3] Verificando red compartida...
docker network inspect pronavid-network >nul 2>&1
if %errorlevel% neq 0 (
    echo Creando red pronavid-network...
    docker network create pronavid-network
)

echo [3/3] Reconstruyendo e iniciando servicios...
:: docker compose -f docker-compose.db.yml up -d
docker compose -f docker-compose.backend.yml up --build -d
docker compose -f docker-compose.frontend.yml up --build -d

echo.
echo ==============================================
echo   Servicios Levantados Exitosamente
echo ==============================================
echo   - Backend API: http://localhost:3000
echo   - Frontend Web: http://localhost:5173
echo ==============================================
echo.
pause

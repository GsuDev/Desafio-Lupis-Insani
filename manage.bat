@echo off
setlocal

REM ========================================
REM   Configuración
REM ========================================
set APP_CONTAINER=laravel-app
set WORKER_CONTAINER=laravel-worker
set REVERB_CONTAINER=laravel-reverb
set DB_CONTAINER=mariadb

REM ========================================
REM   Selector de Comandos
REM ========================================
IF "%1"=="" GOTO help
IF "%1"=="start" GOTO start
IF "%1"=="stop" GOTO stop
IF "%1"=="destroy" GOTO destroy
IF "%1"=="bash" GOTO bash
IF "%1"=="logs" GOTO logs
IF "%1"=="fresh" GOTO fresh_cmd
IF "%1"=="composer" GOTO composer_cmd
IF "%1"=="seed" GOTO seed_cmd

echo Comando no reconocido "%1"
GOTO help

REM ========================================
REM   COMANDO: START
REM ========================================
:start
echo [1/6] Levantando DB, Redis y Laravel...
docker compose up -d mariadb redis laravel

echo [2/6] Esperando a MySQL...
CALL :wait_db

echo [3/6] Instalando dependencias Composer...
docker exec %APP_CONTAINER% composer install --no-interaction --prefer-dist

echo [4/6] Ejecutando migraciones (Fresh)...
CALL :run_fresh

echo [5/6] Levantando Worker y Reverb...
docker compose up -d worker reverb

echo [6/6] Levantando Node y Nginx...
docker compose up -d node
CALL :wait_node
echo Node listo, levantando Nginx...
docker compose up -d nginx

echo ========================================
echo    PROYECTO INICIADO CORRECTAMENTE
echo ========================================
GOTO end

REM ========================================
REM   Funciones y otros comandos
REM ========================================

:stop
echo Deteniendo contenedores...
docker compose down -v
GOTO end

:destroy
echo Eliminando todo...
docker compose down -v --remove-orphans
GOTO end

:logs
docker compose logs -f
GOTO end

:bash
docker exec -it %APP_CONTAINER% bash
GOTO end

:fresh_cmd
CALL :run_fresh
GOTO end

:composer_cmd
docker exec %APP_CONTAINER% composer install --no-interaction
GOTO end

:seed_cmd
docker exec %APP_CONTAINER% php artisan db:seed --force
GOTO end

REM ========================================
REM   Lógica de Espera (Subrutinas)
REM ========================================

:wait_db
REM Loop hasta que la conexión PDO funcione
timeout /t 2 /nobreak >nul
docker exec %APP_CONTAINER% php -r "try { new PDO('mysql:host=mariadb;dbname=laravel','laravel','secret'); } catch (Exception $e) { exit(1); }" >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo MySQL esta listo.
    EXIT /B 0
)
echo MySQL aun no responde, reintentando...
GOTO wait_db

:run_fresh
REM Loop para migraciones
docker exec %APP_CONTAINER% php artisan migrate:fresh --seed >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo Migraciones aplicadas correctamente.
    EXIT /B 0
)
echo Fallo al migrar, reintentando en 2s...
timeout /t 2 /nobreak >nul
GOTO run_fresh

:wait_node
REM Esperar a que el contenedor vite-client reporte "running"
timeout /t 1 /nobreak >nul
FOR /F "tokens=*" %%g IN ('docker inspect -f "{{.State.Running}}" vite-client 2^>nul') do (SET NODE_STATUS=%%g)
IF "%NODE_STATUS%"=="true" (
    EXIT /B 0
)
echo Esperando a Node...
GOTO wait_node

:help
echo.
echo Uso: manage.bat [comando]
echo.
echo Comandos disponibles:
echo   start    - Inicia todo el entorno (DB, Laravel, Node, etc)
echo   stop     - Detiene los contenedores
echo   destroy
<#
.SYNOPSIS
    Script de administración del proyecto (Equivalente al Makefile para Windows)
.EXAMPLE
    .\manage.ps1 start
    .\manage.ps1 stop
#>

param (
    [Parameter(Mandatory=$true)]
    [string]$Command
)

# ========================================
#   Configuración
# ========================================
$APP_CONTAINER = "laravel-app"
$WORKER_CONTAINER = "laravel-worker"
$REVERB_CONTAINER = "laravel-reverb"
$DB_CONTAINER = "mariadb"

# ========================================
#   Funciones Auxiliares
# ========================================

function Wait-DB {
    Write-Host "⏳ Esperando a MySQL..." -ForegroundColor Cyan
    $ready = $false
    do {
        # Intentamos conectar via PHP dentro del contenedor
        docker exec $APP_CONTAINER php -r 'try { new PDO("mysql:host=mariadb;dbname=laravel","laravel","secret"); exit(0); } catch (Exception $e) { exit(1); }' 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
        } else {
            Start-Sleep -Seconds 2
        }
    } until ($ready)
    Write-Host "✅ MySQL está listo." -ForegroundColor Green
}

function Wait-Node {
    Write-Host "⏳ Esperando a Node/Vite..." -ForegroundColor Cyan
    do {
        $status = docker inspect -f '{{.State.Running}}' vite-client 2>$null
        if ($status -ne 'true') { Start-Sleep -Seconds 1 }
    } until ($status -eq 'true')
    Write-Host "🚀 Node está listo." -ForegroundColor Green
}

function Run-Fresh {
    Write-Host "🌱 Ejecutando migrate:fresh + seed..." -ForegroundColor Cyan
    $success = $false
    do {
        docker exec $APP_CONTAINER php artisan migrate:fresh --seed 2>$null
        if ($LASTEXITCODE -eq 0) {
            $success = $true
        } else {
            Write-Host "⏳ Migraciones fallaron, reintentando en 2s..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    } until ($success)
    Write-Host "✅ Migraciones aplicadas" -ForegroundColor Green
}

# ========================================
#   Lógica de Comandos
# ========================================

switch ($Command) {
    "start" {
        # 1. Base
        Write-Host "🟢 Levantando DB, Redis y Laravel..." -ForegroundColor Cyan
        docker compose up -d mariadb redis laravel
        
        # 2. Esperar DB
        Wait-DB
        
        # 3. Composer
        Write-Host "📦 Instalando dependencias Composer..." -ForegroundColor Cyan
        docker exec $APP_CONTAINER composer install --no-interaction
        
        # 4. Fresh Migrations
        Run-Fresh
        
        # 5. Services
        Write-Host "⚡ Levantando Worker y Reverb..." -ForegroundColor Cyan
        docker compose up -d worker reverb
        
        # 6. Node
        Write-Host "🚀 Levantando Node/Vite..." -ForegroundColor Cyan
        docker compose up -d node
        
        # 7. Nginx (esperando a Node)
        Wait-Node
        Write-Host "🚀 Levantando Nginx..." -ForegroundColor Cyan
        docker compose up -d nginx
    }

    "node" {
        Write-Host "🚀 Levantando Node/Vite..."
        docker compose up -d node
    }

    "nginx" {
        Wait-Node
        Write-Host "🚀 Levantando Nginx..."
        docker compose up -d nginx
    }

    "up-base" {
        Write-Host "🟢 Levantando DB, Redis y Laravel..."
        docker compose up -d mariadb redis laravel
    }

    "up-services" {
        Write-Host "⚡ Levantando Worker y Reverb..."
        docker compose up -d worker reverb
    }

    "wait-db" {
        Wait-DB
    }

    "composer" {
        Write-Host "📦 Instalando dependencias Composer..."
        docker exec $APP_CONTAINER composer install --no-interaction
    }

    "migrate" {
        Write-Host "🌱 Ejecutando migraciones..."
        docker exec $APP_CONTAINER php artisan migrate --force
    }

    "seed" {
        Write-Host "🌱 Ejecutando seed..."
        docker exec $APP_CONTAINER php artisan db:seed --force
    }

    "fresh" {
        Run-Fresh
    }

    "stop" {
        Write-Host "🛑 Deteniendo contenedores..." -ForegroundColor Red
        docker compose down -v
    }

    "destroy" {
        Write-Host "💥 Eliminando contenedores y volúmenes..." -ForegroundColor Red
        docker compose down -v --remove-orphans
    }

    "logs" {
        docker compose logs -f
    }

    "bash" {
        docker exec -it $APP_CONTAINER bash
    }

    "reload-jobs" {
        Write-Host "🔄 Cargando cambios en los jobs"
        docker compose restart worker
    }

    Default {
        Write-Host "Comando no reconocido. Uso: .\manage.ps1 [start|stop|fresh|...]" -ForegroundColor Yellow
    }
}
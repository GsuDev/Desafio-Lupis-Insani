# ========================================
#   Nombres de contenedores Docker
# ========================================
APP_CONTAINER=laravel-app
WORKER_CONTAINER=laravel-worker
REVERB_CONTAINER=laravel-reverb
DB_CONTAINER=mariadb


# ========================================
#   Objetivos phony
# ========================================
.PHONY: start node nginx up-base up-services wait-db composer migrate seed fresh stop destroy logs bash

# ========================================
#   Arranque completo correcto
# ========================================
# 1. Levanta DB + Laravel
# 2. Espera a MySQL
# 3. Corre composer, migrate, seed
# 4. Levanta worker + reverb
# 5. Levanta node (vite)
# 6. Levanta nginx
start: up-base wait-db composer fresh up-services node nginx

# ========================================
# Levantar Node después de migraciones
# ========================================
node:
	@echo "🚀 Levantando Node/Vite..."
	docker compose up -d node

# ========================================
# Levantar Nginx después de Node
# ========================================
nginx:
	@echo "⏳ Esperando a Node/Vite..."
	@until [ "`docker inspect -f '{{.State.Running}}' vite-client`" = "true" ]; do \
		sleep 1; \
	done
	@echo "🚀 Node está listo, levantando Nginx..."
	docker compose up -d nginx


# ========================================
#   Servicios base: DB + Laravel
# ========================================
up-base:
	@echo "🟢 Levantando DB, Redis y Laravel..."
	docker compose up -d mariadb redis laravel

# ========================================
#   Arrancar worker + reverb después de migrar
# ========================================
up-services:
	@echo "⚡ Levantando Worker y Reverb..."
	docker compose up -d worker reverb  

# ========================================
#   Utilidades
# ========================================
wait-db:
	@echo "⏳ Esperando a MySQL..."
	@until docker exec $(APP_CONTAINER) php -r 'try { new PDO("mysql:host=mariadb;dbname=laravel","laravel","secret"); } catch (Exception $$e) {}' 2>/dev/null; do \
		sleep 2; \
	done
	@echo "✅ MySQL está listo."

composer:
	@echo "📦 Instalando dependencias Composer..."
	docker exec $(APP_CONTAINER) composer install --no-interaction

migrate:
	@echo "🌱 Ejecutando migraciones..."
	docker exec $(APP_CONTAINER) php artisan migrate --force

seed:
	@echo "🌱 Ejecutando seed..."
	docker exec $(APP_CONTAINER) php artisan db:seed --force

fresh:
	@echo "🌱 Ejecutando migrate:fresh + seed..."
	@until docker exec $(APP_CONTAINER) php artisan migrate:fresh --seed >/dev/null 2>&1; do \
		echo "⏳ Migraciones fallaron, reintentando en 2s..."; \
		sleep 2; \
	done
	@echo "✅ Migraciones aplicadas"


# ========================================
#   Mantenimiento
# ========================================
stop:
	@echo "🛑 Deteniendo contenedores..."
	docker compose down -v

destroy:
	@echo "💥 Eliminando contenedores y volúmenes..."
	docker compose down -v --remove-orphans

logs:
	docker compose logs -f

bash:
	docker exec -it $(APP_CONTAINER) bash

# ========================================
# Recargar cambios en los jobs
# ========================================
reload jobs:
	@echo "🔄 Cargando cambios en los jobs"
	docker compose restart worker


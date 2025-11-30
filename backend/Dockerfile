# -----------------------------
# Base PHP FPM con extensiones Laravel
# -----------------------------
FROM php:8.2-fpm

# -----------------------------
# Variables de entorno
# -----------------------------
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV PATH="$PATH:/root/.composer/vendor/bin"

# -----------------------------
# Instalar dependencias del sistema y extensiones PHP necesarias
# -----------------------------
RUN apt-get update && apt-get install -y \
    zip unzip git curl libpng-dev libonig-dev libxml2-dev libzip-dev \
    nodejs npm \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# -----------------------------
# Instalar Composer globalmente
# -----------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# -----------------------------
# CONFIGURACIÓN PARA PODER USAR TINKER
# -----------------------------
RUN mkdir -p /var/www/.config/psysh && \
    chmod -R 777 /var/www/.config

# -----------------------------
# Crear carpeta de la app y setear permisos
# -----------------------------
WORKDIR /var/www/html
RUN chown -R www-data:www-data /var/www/html
USER www-data

# -----------------------------
# Node.js para Laravel Reverb
# -----------------------------
# Node y npm ya instalados arriba para poder usar Reverb en este contenedor
# Si Reverb va a otro contenedor, puedes omitir nodejs/npm

# -----------------------------
# Entrypoint opcional para instalar dependencias y migrar DB
# -----------------------------
# Puedes usarlo solo la primera vez con `docker-compose run laravel composer install`
# o con un script separado

FROM php:8.4-fpm

# Dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql zip opcache \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/symfony

# Installer les dépendances PHP en premier (meilleur cache Docker)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copier le code
COPY . .

# Finaliser l'installation
RUN composer install --no-dev --optimize-autoloader --prefer-dist

# Permissions
RUN mkdir -p var/cache var/log public/uploads \
    && chown -R www-data:www-data var/ public/uploads \
    && chmod -R 775 var/

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]

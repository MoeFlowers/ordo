FROM php:8.2-apache

# Extensiones necesarias: SQLite (base de datos) y utilidades
RUN apt-get update \
    && apt-get install -y --no-install-recommends libsqlite3-dev unzip git \
    && docker-php-ext-install pdo pdo_sqlite \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

# Sin caché para los assets (útil al editar en desarrollo)
RUN printf '<FilesMatch "\\.(html|js|css)$">\n  Header set Cache-Control "no-cache, must-revalidate"\n</FilesMatch>\n' > /etc/apache2/conf-available/no-cache.conf \
    && a2enconf no-cache

# Composer (para PHPMailer)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Dependencias PHP (PHPMailer)
COPY composer.json ./
RUN composer install --no-interaction --no-dev --optimize-autoloader

# Codigo de la app
COPY public/ ./public/

# Servir la carpeta public/ como raiz web
RUN sed -ri 's#DocumentRoot /var/www/html#DocumentRoot /var/www/html/public#' /etc/apache2/sites-available/000-default.conf \
    && sed -ri 's#<Directory /var/www/>#<Directory /var/www/html/public/>#' /etc/apache2/apache2.conf

# Carpeta de datos con permisos de escritura
RUN mkdir -p /var/www/html/data && chown -R www-data:www-data /var/www/html/data

EXPOSE 80

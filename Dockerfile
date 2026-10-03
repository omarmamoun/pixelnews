FROM php:8.3-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends libcurl4-openssl-dev libonig-dev libsodium-dev \
    && docker-php-ext-install curl mbstring mysqli pdo pdo_mysql sodium \
    && a2enmod rewrite headers \
    && printf '%s\n' '<Directory /var/www/html>' '    AllowOverride All' '    Require all granted' '    Options FollowSymLinks' '</Directory>' > /etc/apache2/conf-available/pixelnews.conf \
    && a2enconf pixelnews \
    && printf '%s\n' 'upload_max_filesize=50M' 'post_max_size=55M' 'max_execution_time=120' > /usr/local/etc/php/conf.d/pixelnews.ini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
COPY . /var/www/html/
COPY docker-entrypoint.sh /usr/local/bin/pixelnews-entrypoint
RUN chmod 0755 /usr/local/bin/pixelnews-entrypoint \
    && chmod -R a+rX /var/www/html

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/pixelnews-entrypoint"]
CMD ["apache2-foreground"]

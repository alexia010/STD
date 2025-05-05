# Etapa 1: Build
FROM joomla:latest AS builder
WORKDIR /var/www/html
RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*
COPY ./config/helixultimate_template_v2.1.2.zip .
RUN unzip ./helixultimate_template_v2.1.2.zip -d ./helix_ultimate \
    && rm helixultimate_template_v2.1.2.zip

# Etapa 2: Runtime
FROM joomla:latest
WORKDIR /var/www/html
RUN apt-get update && apt-get install -y libreoffice \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html
COPY config/php.ini /usr/local/etc/php/php.ini
COPY --from=builder /var/www/html/helix_ultimate /var/www/html/templates/helix_ultimate
EXPOSE 80
CMD ["apache2-foreground"]

# stage 1:  build
FROM joomla:latest AS builder
#imagine oficial joomla

WORKDIR /var/www/html
# setare director de lucru 

COPY ./config/helixultimate_template_v2.1.2.zip .
#copiaza tema Helix Ultimate din directorul local 

RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

RUN unzip ./helixultimate_template_v2.1.2.zip -d ./helix_ultimate \
    && rm helixultimate_template_v2.1.2.zip

# Etapa 2: Runtime
FROM joomla:latest

WORKDIR /var/www/html

#instalare dependinte
RUN apt-get update && apt-get install -y libreoffice \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

#LibreOffice -> conversia documentelor
#curatare cache -> reducere dimensiune imagine

COPY config/php.ini /usr/local/etc/php/php.ini
#adauga config. personalizata PHP din fisierul local

COPY --from=builder /var/www/html/helix_ultimate /var/www/html/templates/helix_ultimate
#copiaza tema Helix din prima etapa in imaginea finala

EXPOSE 80
#portul pe care va rula aplicatia

CMD ["apache2-foreground"]
#comanda de pornire pt container 

ARG GOIP_PLATFORM=linux/amd64
FROM --platform=${GOIP_PLATFORM} debian/eol:jessie

ENV DEBIAN_FRONTEND=noninteractive

RUN dpkg --add-architecture i386 \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        apache2 \
        ca-certificates \
        libc6:i386 \
        libgssapi-krb5-2:i386 \
        libapache2-mod-php5 \
        mysql-client-5.5 \
        mysql-server-5.5 \
        php5 \
        php5-mysql \
        psmisc \
        zlib1g:i386 \
    && rm -f /var/log/apache2/*.log /var/log/mysql/*.log \
    && rm -rf /var/lib/apt/lists/*

COPY goip/ /usr/local/goip/
RUN chmod -R 777 /usr/local/goip \
    && ln -s /usr/local/goip /var/www/goip \
    && rm -f /var/www/html/index.html \
    && printf '%s\n' \
        'Alias /goip "/var/www/goip"' \
        '<Directory "/var/www/goip">' \
        '    Options FollowSymLinks Indexes MultiViews' \
        '    AllowOverride None' \
        '    Require all granted' \
        '</Directory>' \
        'RedirectMatch ^/$ /goip/en/' \
        > /etc/apache2/conf-available/goip.conf \
    && a2enconf goip \
    && a2enmod php5 \
    && printf '%s\n' 'ServerName localhost' > /etc/apache2/conf-available/servername.conf \
    && a2enconf servername \
    && printf '%s\n' \
        'auto_prepend_file = /usr/local/goip/inc/bootstrap.php' \
        'session.save_path = "/var/lib/php5/sessions"' \
        'session.cookie_lifetime = 0' \
        'session.gc_maxlifetime = 86400' \
        > /etc/php5/apache2/conf.d/99-goip.ini

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY docker-entrypoint-core.sh /usr/local/bin/docker-entrypoint-core.sh
COPY docker-entrypoint-web.sh /usr/local/bin/docker-entrypoint-web.sh
RUN chmod +x /usr/local/bin/docker-entrypoint*.sh

EXPOSE 80/tcp 44444/udp 3306/tcp

ENTRYPOINT ["docker-entrypoint.sh"]

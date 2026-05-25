#!/bin/sh
# Core container — runs MySQL + goipcron only (no Apache, no PHP web).
# Devices connect here on UDP 44444. Web container reads/writes the DB over the docker network.
set -eu

cleanup() {
    killall goipcron >/dev/null 2>&1 || true
    mysqladmin shutdown >/dev/null 2>&1 || true
}
trap cleanup INT TERM

mkdir -p /run/mysqld /var/lib/mysql
chown -R mysql:mysql /run/mysqld /var/lib/mysql
ln -sf /run/mysqld/mysqld.sock /var/lib/mysql/mysql.sock

# MySQL must accept connections from the web container
sed -i 's/^bind-address.*$/bind-address = 0.0.0.0/' /etc/mysql/my.cnf

# Regenerate config.inc.php from env so PHP + goipcron read the same settings
cat > /usr/local/goip/inc/config.inc.php <<EOF
<?php
\$dbhost='${GOIP_DB_HOST:-localhost}';
\$dbuser='${GOIP_DB_USER:-goip}';
\$dbpw='${GOIP_DB_PASS:-goip}';
\$dbname='${GOIP_DB_NAME:-goip}';
\$goipcronport='${GOIP_CRON_PORT:-44444}';
\$goipcronhost='${GOIP_CRON_HOST:-127.0.0.1}';
\$charset='utf8';
\$endless_send=0;
\$re_ask_timer=3;
?>
EOF

if [ ! -d /var/lib/mysql/mysql ]; then
    mysql_install_db --user=mysql --datadir=/var/lib/mysql >/dev/null
fi

mysqld_safe --datadir=/var/lib/mysql --socket=/run/mysqld/mysqld.sock &

until mysqladmin ping --silent; do sleep 1; done

if ! mysql -uroot -e "USE goip" >/dev/null 2>&1; then
    echo "[core] fresh install — importing schema"
    mysql -uroot < /usr/local/goip/goipinit.sql
else
    echo "[core] existing DB — applying schema updates"
    cd /usr/local/goip && php5 update.php >/dev/null 2>&1 || true
fi

# Grant goip user from any host (web container needs network access)
mysql -uroot -e "GRANT ALL PRIVILEGES ON goip.* TO 'goip'@'%' IDENTIFIED BY 'goip'; FLUSH PRIVILEGES;" || true

killall goipcron >/dev/null 2>&1 || true
cd /usr/local/goip
./goipcron inc/config.inc.php

# Tail mysql log to keep PID 1 alive and surface events
exec tail -F /var/log/mysql/error.log

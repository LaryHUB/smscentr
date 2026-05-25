#!/bin/sh
set -eu

cleanup() {
    killall goipcron >/dev/null 2>&1 || true
    apache2ctl stop >/dev/null 2>&1 || true
    mysqladmin shutdown >/dev/null 2>&1 || true
}
trap cleanup INT TERM

mkdir -p /run/mysqld /var/lib/mysql
chown -R mysql:mysql /run/mysqld /var/lib/mysql
ln -sf /run/mysqld/mysqld.sock /var/lib/mysql/mysql.sock

# Allow external connections to MySQL (default vendor my.cnf binds to 127.0.0.1)
sed -i 's/^bind-address.*$/bind-address = 0.0.0.0/' /etc/mysql/my.cnf

if [ ! -d /var/lib/mysql/mysql ]; then
    mysql_install_db --user=mysql --datadir=/var/lib/mysql >/dev/null
fi

mysqld_safe --datadir=/var/lib/mysql --socket=/run/mysqld/mysqld.sock &

until mysqladmin ping --silent; do
    sleep 1
done

if ! mysql -uroot -e "USE goip" >/dev/null 2>&1; then
    echo "[entrypoint] no goip database found in the volume — installing fresh schema"
    mysql -uroot < /usr/local/goip/goipinit.sql
else
    echo "[entrypoint] existing goip database in the volume — preserving data, applying any new schema changes"
    cd /usr/local/goip && php5 update.php >/dev/null 2>&1 || echo "[entrypoint] update.php exited non-zero (continuing — schema may already be current)"
fi

# Grant the goip user access from any host (default vendor sql only grants @localhost)
mysql -uroot -e "GRANT ALL PRIVILEGES ON goip.* TO 'goip'@'%' IDENTIFIED BY 'goip'; FLUSH PRIVILEGES;" || true

killall goipcron >/dev/null 2>&1 || true
cd /usr/local/goip
./goipcron inc/config.inc.php

apache2ctl -D FOREGROUND &
wait "$!"

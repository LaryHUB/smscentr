#!/bin/sh
# Web container — runs Apache + PHP only. Talks to the core container for DB
# (MySQL) and goipcron (UDP). No mysqld, no goipcron, no SIM logic here.
set -eu

cleanup() {
    apache2ctl stop >/dev/null 2>&1 || true
}
trap cleanup INT TERM

mkdir -p /var/lib/php5/sessions
chown -R www-data:www-data /var/lib/php5/sessions
chmod 1733 /var/lib/php5/sessions

DB_HOST="${GOIP_DB_HOST:-goip-core}"
DB_USER="${GOIP_DB_USER:-goip}"
DB_PASS="${GOIP_DB_PASS:-goip}"
DB_NAME="${GOIP_DB_NAME:-goip}"
CRON_HOST="${GOIP_CRON_HOST:-goip-core}"
CRON_PORT="${GOIP_CRON_PORT:-44444}"

# Regenerate config.inc.php so PHP points at the core container
cat > /usr/local/goip/inc/config.inc.php <<EOF
<?php
\$dbhost='${DB_HOST}';
\$dbuser='${DB_USER}';
\$dbpw='${DB_PASS}';
\$dbname='${DB_NAME}';
\$goipcronport='${CRON_PORT}';
\$goipcronhost='${CRON_HOST}';
\$charset='utf8';
\$endless_send=0;
\$re_ask_timer=3;
?>
EOF

echo "[web] waiting for ${DB_HOST}:3306"
for i in $(seq 1 60); do
    if mysqladmin ping -h "$DB_HOST" -u"$DB_USER" -p"$DB_PASS" --silent 2>/dev/null; then
        echo "[web] DB reachable in ${i}s"
        break
    fi
    sleep 1
done

# Load Apache env (APACHE_RUN_USER etc.), drop any stale pidfile, then exec
# apache directly as PID 1 so signals + container lifecycle work cleanly.
set +u                                  # envvars references parameters before defining them
. /etc/apache2/envvars
set -u
rm -f /var/run/apache2/apache2.pid
exec /usr/sbin/apache2 -DFOREGROUND

#!/bin/sh
# One-shot installer: docker + split-container deployment (core + web).
# Devices register on UDP 44444 (core container); web admin lives on 8088 (web container).
# Restarting/rebuilding the web container never disconnects the devices.
#
# Usage: curl -fsSL https://raw.githubusercontent.com/LaryHUB/smscentr/main/setup.sh | sudo sh
set -eu

REPO_URL="https://github.com/LaryHUB/smscentr.git#main"
IMAGE_NAME="goip-sms-server:patched"
PROJECT="${GOIP_PROJECT:-goip}"
HTTP_PORT="${GOIP_HTTP_PORT:-8088}"
UDP_PORT="${GOIP_UDP_PORT:-44444}"
MYSQL_PORT="${GOIP_MYSQL_PORT:-3306}"
BIND_ADDR="${GOIP_BIND_ADDR:-0.0.0.0}"
MYSQL_BIND_ADDR="${GOIP_MYSQL_BIND_ADDR:-127.0.0.1}"

log() { printf '\033[1;34m[setup]\033[0m %s\n' "$*"; }
err() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || err "run as root or via sudo"

# 1. docker
if ! command -v docker >/dev/null 2>&1; then
    log "installing docker"
    export DEBIAN_FRONTEND=noninteractive
    if ! command -v curl >/dev/null 2>&1; then
        if   command -v apt-get >/dev/null 2>&1; then apt-get update -qq && apt-get install -y -qq --no-install-recommends curl ca-certificates >/dev/null
        elif command -v yum     >/dev/null 2>&1; then yum install -y curl ca-certificates >/dev/null
        elif command -v dnf     >/dev/null 2>&1; then dnf install -y curl ca-certificates >/dev/null
        elif command -v apk     >/dev/null 2>&1; then apk add --no-cache curl ca-certificates >/dev/null
        else err "no supported package manager"; fi
    fi
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker 2>/dev/null || service docker start 2>/dev/null || true
fi
docker info >/dev/null 2>&1 || err "docker daemon not running"

# Detect compose command
COMPOSE=""
if docker compose version >/dev/null 2>&1; then COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then COMPOSE="docker-compose"
else
    log "installing docker-compose plugin"
    if command -v apt-get >/dev/null 2>&1; then
        apt-get update -qq && apt-get install -y -qq docker-compose-plugin >/dev/null 2>&1 || \
            apt-get install -y -qq docker-compose >/dev/null
    fi
    docker compose version >/dev/null 2>&1 && COMPOSE="docker compose" || COMPOSE="docker-compose"
fi

# 2. Build image from git (no local source tree on host)
log "building $IMAGE_NAME from $REPO_URL"
docker build -t "$IMAGE_NAME" "$REPO_URL" >/dev/null

# 3. Write compose file into a temp dir with port overrides
WORK_DIR="/var/lib/${PROJECT}"
mkdir -p "$WORK_DIR"
cat > "$WORK_DIR/docker-compose.yml" <<EOF
services:
  goip-core:
    image: ${IMAGE_NAME}
    container_name: ${PROJECT}-core
    restart: unless-stopped
    entrypoint: ["/usr/local/bin/docker-entrypoint-core.sh"]
    networks: [goip-net]
    ports:
      - "${BIND_ADDR}:${UDP_PORT}:44444/udp"
      - "${MYSQL_BIND_ADDR}:${MYSQL_PORT}:3306/tcp"
    volumes:
      - goip-mysql:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "--silent"]
      interval: 10s
      timeout: 5s
      retries: 10

  goip-web:
    image: ${IMAGE_NAME}
    container_name: ${PROJECT}-web
    restart: unless-stopped
    entrypoint: ["/usr/local/bin/docker-entrypoint-web.sh"]
    depends_on:
      goip-core:
        condition: service_healthy
    networks: [goip-net]
    ports:
      - "${BIND_ADDR}:${HTTP_PORT}:80/tcp"
    volumes:
      - goip-sessions:/var/lib/php5/sessions
    environment:
      GOIP_DB_HOST: goip-core
      GOIP_CRON_HOST: goip-core
      GOIP_CRON_PORT: 44444

networks:
  goip-net:
    driver: bridge

volumes:
  goip-mysql:
  goip-sessions:
EOF

log "starting services via compose"
cd "$WORK_DIR"
$COMPOSE down --remove-orphans >/dev/null 2>&1 || true
$COMPOSE up -d

HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$HOST_IP" ] && HOST_IP=$(hostname)

log "done"
log ""
log "web admin:  http://$HOST_IP:$HTTP_PORT/goip      login: root / root"
log "goipcron:   $HOST_IP:$UDP_PORT/udp              point GoIP devices here"
log "mysql:      $MYSQL_BIND_ADDR:$MYSQL_PORT             user goip / pass goip (db: goip)"
log ""
log "logs:    cd $WORK_DIR && $COMPOSE logs -f"
log "stop:    cd $WORK_DIR && $COMPOSE down"
log "restart only web (devices stay connected):  cd $WORK_DIR && $COMPOSE restart goip-web"

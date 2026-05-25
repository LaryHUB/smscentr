#!/bin/sh
# GoIP SMS Server installer (patched build)
# Bug fixes: USSD START handshake, mysql_real_escape_string -> mysqli, GoIPCron module.

set -eu

IMAGE_TAR="goip-sms-server.tar.gz"
IMAGE_NAME="goip-sms-server:patched"
CONTAINER_NAME="${GOIP_CONTAINER:-goip-sms-server}"
HTTP_PORT="${GOIP_HTTP_PORT:-8088}"
UDP_PORT="${GOIP_UDP_PORT:-44444}"
MYSQL_PORT="${GOIP_MYSQL_PORT:-3306}"
BIND_ADDR="${GOIP_BIND_ADDR:-0.0.0.0}"
MYSQL_BIND_ADDR="${GOIP_MYSQL_BIND_ADDR:-127.0.0.1}"
VOLUME_NAME="${GOIP_VOLUME:-goip-mysql}"

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"

log() { printf '\033[1;34m[install]\033[0m %s\n' "$*"; }
err() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; }

command -v docker >/dev/null 2>&1 || { err "docker not found in PATH"; exit 1; }
[ -f "$IMAGE_TAR" ] || { err "image archive $IMAGE_TAR not found next to install.sh"; exit 1; }

log "loading image from $IMAGE_TAR"
gunzip -c "$IMAGE_TAR" | docker load

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
    log "stopping existing container $CONTAINER_NAME"
    docker rm -f "$CONTAINER_NAME" >/dev/null
fi

log "ensuring volume $VOLUME_NAME"
docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1 || docker volume create "$VOLUME_NAME" >/dev/null

log "starting container $CONTAINER_NAME"
log "  http  $BIND_ADDR:$HTTP_PORT -> 80"
log "  udp   $BIND_ADDR:$UDP_PORT -> 44444"
log "  mysql $MYSQL_BIND_ADDR:$MYSQL_PORT -> 3306"
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$BIND_ADDR:$HTTP_PORT:80/tcp" \
    -p "$BIND_ADDR:$UDP_PORT:44444/udp" \
    -p "$MYSQL_BIND_ADDR:$MYSQL_PORT:3306/tcp" \
    -v "$VOLUME_NAME:/var/lib/mysql" \
    "$IMAGE_NAME" >/dev/null

HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$HOST_IP" ] && HOST_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "<host-ip>")

log "done"
log "web admin:  http://$HOST_IP:$HTTP_PORT/goip"
log "             login: root / root"
log "goipcron:   $HOST_IP:$UDP_PORT/udp (point your GoIP devices here)"
log "mysql:      $MYSQL_BIND_ADDR:$MYSQL_PORT"
log "             user goip / pass goip  (database: goip)"
log "             root / no password"
log ""
log "logs:  docker logs -f $CONTAINER_NAME"
log "stop:  docker rm -f $CONTAINER_NAME"
log ""
log "if external access fails: check host firewall allows $HTTP_PORT/tcp and $UDP_PORT/udp"

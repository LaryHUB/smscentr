#!/bin/sh
# One-shot installer: docker + build + run. Nothing besides docker is installed on the host.
# Usage:  curl -fsSL https://raw.githubusercontent.com/LaryHUB/smscentr/main/setup.sh | sudo sh
set -eu

REPO_URL="https://github.com/LaryHUB/smscentr.git#main"
IMAGE_NAME="goip-sms-server:patched"
CONTAINER_NAME="${GOIP_CONTAINER:-goip-sms-server}"
HTTP_PORT="${GOIP_HTTP_PORT:-8088}"
UDP_PORT="${GOIP_UDP_PORT:-44444}"
MYSQL_PORT="${GOIP_MYSQL_PORT:-3306}"
BIND_ADDR="${GOIP_BIND_ADDR:-0.0.0.0}"
MYSQL_BIND_ADDR="${GOIP_MYSQL_BIND_ADDR:-127.0.0.1}"
VOLUME_NAME="${GOIP_VOLUME:-goip-mysql}"
SESSIONS_VOLUME="${GOIP_SESSIONS_VOLUME:-goip-sessions}"

log() { printf '\033[1;34m[setup]\033[0m %s\n' "$*"; }
err() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || err "run as root or via sudo"

# 1. docker on host (the only host dependency)
if ! command -v docker >/dev/null 2>&1; then
    log "installing docker via get.docker.com"
    export DEBIAN_FRONTEND=noninteractive
    if ! command -v curl >/dev/null 2>&1; then
        if   command -v apt-get >/dev/null 2>&1; then apt-get update -qq && apt-get install -y -qq --no-install-recommends curl ca-certificates >/dev/null
        elif command -v yum     >/dev/null 2>&1; then yum install -y curl ca-certificates >/dev/null
        elif command -v dnf     >/dev/null 2>&1; then dnf install -y curl ca-certificates >/dev/null
        elif command -v apk     >/dev/null 2>&1; then apk add --no-cache curl ca-certificates >/dev/null
        else err "curl missing and no supported package manager (apt/yum/dnf/apk)"; fi
    fi
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker 2>/dev/null || service docker start 2>/dev/null || true
fi
docker info >/dev/null 2>&1 || err "docker is installed but daemon is not running"

# 2. build directly from git — docker daemon fetches the repo, no files on the host
log "building image from $REPO_URL (no source clone on host)"
docker build -t "$IMAGE_NAME" "$REPO_URL" >/dev/null

# 3. run
if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
    log "removing existing container $CONTAINER_NAME"
    docker rm -f "$CONTAINER_NAME" >/dev/null
fi
docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1 || docker volume create "$VOLUME_NAME" >/dev/null
docker volume inspect "$SESSIONS_VOLUME" >/dev/null 2>&1 || docker volume create "$SESSIONS_VOLUME" >/dev/null

log "starting container $CONTAINER_NAME"
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$BIND_ADDR:$HTTP_PORT:80/tcp" \
    -p "$BIND_ADDR:$UDP_PORT:44444/udp" \
    -p "$MYSQL_BIND_ADDR:$MYSQL_PORT:3306/tcp" \
    -v "$VOLUME_NAME:/var/lib/mysql" \
    -v "$SESSIONS_VOLUME:/var/lib/php5/sessions" \
    "$IMAGE_NAME" >/dev/null

HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$HOST_IP" ] && HOST_IP=$(hostname)

log "done"
log ""
log "web admin:  http://$HOST_IP:$HTTP_PORT/goip      login: root / root"
log "goipcron:   $HOST_IP:$UDP_PORT/udp              point GoIP devices here"
log "mysql:      $MYSQL_BIND_ADDR:$MYSQL_PORT             user goip / pass goip (db: goip)"
log ""
log "logs:   docker logs -f $CONTAINER_NAME"
log "stop:   docker rm -f $CONTAINER_NAME"
log "rebuild: docker build -t $IMAGE_NAME $REPO_URL"

# GoIP SMS Server (patched)

Docker image for GoIP SMS Server with USSD/SMS bug fixes on top of the vendor build from dbltek.com.

## Default credentials

All are vendor defaults — change them in production.

| What | User | Password |
|---|---|---|
| Web admin (`/goip`) | `root` | `root` |
| MySQL (database `goip`) | `goip` | `goip` |
| MySQL root | `root` | *(no password)* |

## Stack

- Debian Jessie (EOL), Apache 2.4, MySQL 5.5, PHP 5 — required by the vendor
- `linux/amd64` (vendor `goipcron` is a 32-bit x86 ELF; runs under `qemu-i386` on other archs)

## Bug fixes applied

| Bug | Files | Effect |
|---|---|---|
| `if($buf=="OK")` instead of parsing `OK <recvid>` | 29 PHP files | START handshake never completed — USSD/SMS/CMD silently never sent |
| `mysql_real_escape_string($ussdmsg)` with no `mysql_connect()` (codebase uses `mysqli`) | 7 PHP files | USSD response was blanked out before reaching the client |
| `inc/goipcron.inc.php` (new) | added | `GoIPCron` class — socket, handshake, recv, done, close |
| `ussd.php`, `en/ussd.php` | refactored | now use `GoIPCron`, ~30 lines shorter each |

The full patched source tree lives under [`goip/`](goip/) — every PHP file the vendor ships, with the fixes applied. The Dockerfile COPYs it in directly (no vendor download at build time).

## One-shot install on bare Ubuntu/Debian

A single command, no prerequisites — installs Docker, downloads sources, builds, and runs the container:

```sh
sudo sh -c 'apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq curl ca-certificates && curl -fsSL https://raw.githubusercontent.com/LaryHUB/smscentr/main/setup.sh | sh'
```

After it finishes: open `http://<host>:8088/goip`, login `root` / `root`.

## Build

```sh
docker build -t goip-sms-server:patched .
```

## Run (built locally)

```sh
docker run -d \
    --name goip-sms-server \
    --restart unless-stopped \
    -p 0.0.0.0:8088:80/tcp \
    -p 0.0.0.0:44444:44444/udp \
    -p 127.0.0.1:3306:3306/tcp \
    -v goip-mysql:/var/lib/mysql \
    goip-sms-server:patched
```

Open `http://<host>:8088/goip` — login `root` / `root`.

## Run from prebuilt image

A prebuilt image is attached to GitHub Releases as `goip-sms-server.tar.gz`. Download it together with `install.sh` and run:

```sh
./install.sh
```

### Environment overrides for install.sh

| Variable | Default | Notes |
|---|---|---|
| `GOIP_CONTAINER` | `goip-sms-server` | |
| `GOIP_HTTP_PORT` | `8088` | web admin |
| `GOIP_UDP_PORT` | `44444` | goipcron — point GoIP devices here |
| `GOIP_MYSQL_PORT` | `3306` | host port for MySQL |
| `GOIP_BIND_ADDR` | `0.0.0.0` | binds HTTP+UDP to all interfaces |
| `GOIP_MYSQL_BIND_ADDR` | `127.0.0.1` | MySQL bound to loopback only by default |
| `GOIP_VOLUME` | `goip-mysql` | named docker volume for `/var/lib/mysql` |

Open MySQL to the network only if you trust it — the `goip` user has the default password `goip`.

## Data persistence

MySQL data lives in the named docker volume `goip-mysql`. It survives `docker rm` and `docker build` — rebuild the image as many times as you want, the database stays.

Entrypoint logic on container start:
- **Empty volume** → imports `goipinit.sql` from the image (fresh install).
- **Existing volume with `goip` database** → keeps the data and runs `update.php` to apply any new schema migrations (vendor's idempotent `ALTER TABLE` script).

To force a fresh install, delete the volume:

```sh
docker rm -f goip-sms-server
docker volume rm goip-mysql
```

To back up before risky changes:

```sh
docker exec goip-sms-server mysqldump -uroot goip > goip-$(date +%F).sql
```

## Repo layout

```
Dockerfile              builds the patched image directly from goip/
docker-entrypoint.sh    starts mysql (bind 0.0.0.0, grant goip@%), goipcron, apache
install.sh              loads prebuilt image + runs container
goip/                   full GoIP software tree (279 files, ~7 MB)
  inc/goipcron.inc.php  new GoIPCron class
  inc/config.inc.php    DB config (host/user/pw)
  inc/conn.inc.php      mysqli connection class
  ussd.php              refactored
  en/ussd.php           refactored
  ...                   bug-fixed copies of vendor files
```

# SetMeld Pod — Docker Compose Deployment

This package provides an on-premise, enterprise-grade deployment of SetMeld Pod using Docker Compose. It is designed for system administrators deploying behind corporate firewalls, often in offline or highly restricted environments.

**Philosophy:** *Batteries included, but removable.* Everything is driven by a single, heavily commented `.env` file. No magic scripts, no GUI installers, no hardcoded configuration.

---

## 5-Step Installation (Target Developer Experience)

1. **Download and extract the package**
   ```bash
   tar -xzf fedresda-node-deploy-*.tar.gz
   cd fedresda-node-deploy
   ```

2. **Copy the environment template**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` in plain text**
   - Set your **BASE_URL** (e.g. `https://pod.mycompany.internal`).
   - Set **HOST_DATA_DIR** to your data volume or NFS mount (e.g. `/mnt/nfs/setmeld-data`).
   - If you are behind a reverse proxy (F5, nginx, etc.), set **TRUST_PROXY=true**.
   - To use your own triplestore, set **TRIPLESTORE_URL**. Leave it blank to use the bundled triplestore.

4. **Optional: Disable bundled Nginx**
   - If you use your own reverse proxy, comment out the `nginx` service in `docker-compose.yml` and expose the `node-app` port as needed. See `proxy-examples/custom-nginx.conf` for a reference config.

5. **Start the stack**
   - **Using the bundled triplestore** (default; leave `TRIPLESTORE_URL` empty):
     ```bash
     docker compose --profile bundled-triplestore up -d
     ```
   - **Using your own triplestore** (set `TRIPLESTORE_URL` in `.env`):
     ```bash
     docker compose up -d
     ```
   The application should be running in under two minutes.

---

## Architecture

| Component    | Role |
|------------|------|
| **node-app**   | Node.js application (Community Solid Server). Listens on port 3000 inside the container; by default exposed only on `127.0.0.1` when Nginx is used. |
| **triplestore**| Optional. Bundled Blazegraph triplestore. Used only if `TRIPLESTORE_URL` is not set. |
| **nginx**      | Optional. Reverse proxy and TLS termination. Can be disabled if you use your own proxy. |

All configuration is via `.env`. No startup scripts run `npm install` or `apt-get`; the Node image is built once with dependencies included.

---

## SSL Modes (when using bundled Nginx)

Set **SSL_MODE** in `.env`:

- **none** — HTTP only (port 80).
- **custom** — HTTPS using your own certificates (set **SSL_CERT_PATH** and **SSL_KEY_PATH**).
- **certbot** — TLS via Let’s Encrypt (requires public reachability and **SSL_EMAIL**).

---

## Offline / Air-Gapped Deployment

1. On a machine with network access: build images and save them:
   ```bash
   docker compose -f docker-compose.yml build
   docker save -o node-app.tar <image-name-from-compose>
   docker save -o triplestore.tar <triplestore-image-name>
   # Copy .env.example, .env, docker-compose.yml, and the .tar files to the target.
   ```
2. On the target machine: load images and start:
   ```bash
   docker load -i node-app.tar
   docker load -i triplestore.tar
   # Adjust docker-compose.yml to use image: instead of build: if desired.
   docker compose up -d
   ```

---

## Using Your Own Reverse Proxy

See **proxy-examples/custom-nginx.conf** for a standalone Nginx configuration you can drop into your existing proxy. It routes to the Node app and sets `X-Forwarded-For` and `X-Forwarded-Proto` correctly. Ensure **TRUST_PROXY=true** in `.env` when using it.

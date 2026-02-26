# SetMeld Pod Deployment

This deployment package is designed for a simple workflow:

1. Edit one config file (`config.env`)
2. Run one script (`./deploy.sh up`)

No manual Docker profile selection, no chmod steps, and no in-container Nginx template logic.

## Quick Start

```bash
tar -xzf fedresda-node-deploy-*.tar.gz
cd fedresda-node-deploy
./deploy.sh init
# edit config.env
./deploy.sh up
```

## Configuration Model

All options live in `config.env`. Key switches:

- `TRIPLESTORE_MODE=bundled|external`
- `PROXY_MODE=nginx|external|none`
- `TLS_MODE=none|custom|letsencrypt` (only when `PROXY_MODE=nginx`)

### Triplestore

- `bundled`: deploy bundled Blazegraph and wire app automatically.
- `external`: set `EXTERNAL_TRIPLESTORE_URL` to your SPARQL endpoint.

### Proxy

- `nginx`: deploy bundled Nginx.
- `external`: do not run Nginx; use your own reverse proxy.
- `none`: no proxy; app is exposed directly on `NODE_HOST_PORT`.

### TLS

- `none`: HTTP only.
- `custom`: set `CUSTOM_CERT_FULLCHAIN` and `CUSTOM_CERT_PRIVKEY` to existing host PEM files.
- `letsencrypt`: set `SSL_EMAIL`; script uses certbot and writes certs under `nginx/letsencrypt`.

## Operational Commands

```bash
./deploy.sh up
./deploy.sh down
./deploy.sh restart
./deploy.sh status
./deploy.sh logs
./deploy.sh renew-certs
```

## Upgrade Flow

1. Back up your existing `config.env`.
2. Extract the new tarball.
3. Copy your `config.env` into the new folder and review diffs vs `config.env.example`.
4. Run `./deploy.sh up`.

## Architecture

- `node-app`: Community Solid Server app container.
- `triplestore`: optional bundled Blazegraph (`TRIPLESTORE_MODE=bundled`).
- `nginx`: optional bundled reverse proxy (`PROXY_MODE=nginx`).
- `certbot`: invoked by `deploy.sh` for Let's Encrypt issue/renew.

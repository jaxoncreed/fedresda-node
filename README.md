# SetMeld Pod

SetMeld Pod: A Solid Pod with tools for deploying data integrations.

## Prerequisites

### Development

- Node.js ≥ 18
- Git
- OpenSSH (dev: `/us/sbin/sshd` available on macOS & Linux)

## Development

### Monorepo Structure

This repository is now an Nx-powered monorepo with three workspace packages:

- `server` (`@fedresda/server`) - Community Solid Server integration and API layer
- `ui` (`@fedresda/ui`) - Expo/React UI application
- `types` (`@fedresda/types`) - Shared LDO/generated schema package consumed by both `server` and `ui`

Top-level tooling (`nx`, workspace install, orchestrated build/dev scripts) lives at the repo root.

### Quick Start

```bash
npm i
npm run dev
```

### Development Usage

After running `npm run dev`, you can:

- Navigate to http://localhost:3000/.integration/
- Click "Sign Up" and create an account with the "Pod Name" "admin"
- Click "Set SSH Key" and paste your ssh key for your personal computer into the modal. (this will allow you to commit to the git repo)
- For dev, all data is stored in the `./data` folder. Look in the `./data/.internal` for integration data. Specifically:
  - `./data/.internal/integration-git`: The root file where git repos are committed.
  - `./data/.internal/integration-code`: The folder integration code is cloned to and run from.
  - `./data/.internal/integration-meta`: Metadata about each integration
  - `./data/.internal/authorized_keys`: Lists the ssh key that is allowed to commit to the integration repo.

3. **Push to the repository**:
   ```bash
   git remote add origin ssh://git@localhost:2229/my_repo_name.git
   git push -u origin main
   ```

### Development Scripts

- `npm run dev` - Start `server` and `ui` via Nx
- `npm run dev:server` - Run only `@fedresda/server`
- `npm run dev:ui` - Run only `@fedresda/ui`
- `npm run build` - Build `types`, `server`, and `ui` via Nx
- `npm run build:types` - Build only `@fedresda/types`
- `npm run build:server` - Build only `@fedresda/server`
- `npm run build:ui` - Build only `@fedresda/ui`
- `npm run graph` - Open the Nx project graph
- `npm run deploy:package` — Build and create the Docker Compose deployment tarball (`build/fedresda-node-deploy-*.tar.gz`)

### Version Management

The version is defined in `version.json` and synchronized to `package.json` and config dependency URLs.

- `npm run version:get` — Get current version
- `npm run version:set <version>` — Set version (e.g. `1.0.0`, `0.2.0-beta.1`)
- `npm run version:bump <type>` — Bump version (major | minor | patch | prerelease)

## Production Deployment (Docker Compose)

SetMeld Pod is shipped as a **Docker Compose deployment package**: a single `.tar.gz` file that contains the app, compose file, and configuration. No Ansible or system packages required.

1. **Build the package** (from this repo):

   ```bash
   npm run deploy:package
   ```

   This produces `build/fedresda-node-deploy-<version>.tar.gz`.

2. **On the target server**: copy the tarball (e.g. via `wget` or SCP), then:
   ```bash
   wget https://github.com/jaxoncreed/fedresda-node/raw/refs/heads/main/build/fedresda-node-deploy-0.0.1-alpha.4.tar.gz
   tar -xzf fedresda-node-deploy-0.0.1-alpha.4.tar.gz
   cd fedresda-node-deploy
   ./deploy.sh init
   # Edit config.env (triplestore/proxy/tls modes and related options)
   ./deploy.sh up
   ```

Full details, SSL options, and proxy examples are in **[deploy/README.md](./deploy/README.md)**.

## Configuration

### CSS Parameters

The Node app (Community Solid Server) supports:

- **TRUST_PROXY** — Set to `true` when behind a reverse proxy (Nginx, F5) so `X-Forwarded-For` and `X-Forwarded-Proto` are trusted.
- **TRIPLESTORE_URL** — SPARQL endpoint. Leave unset in the deploy package to use the bundled Blazegraph; set to your own URL to use an existing triplestore.
- **BASE_URL** — Public base URL of the app (e.g. `https://pod.mycompany.internal`).

All deployment configuration is driven by `config.env` in the deploy package (see `deploy/config.env.example`).

## Architecture

### Services (Docker deployment)

- **node-app** — Community Solid Server (Node.js), port 3000
- **triplestore** — Optional Blazegraph (profile `bundled-triplestore`)
- **nginx** — Optional reverse proxy (can be disabled to use your own)

### Development vs Production

| Aspect   | Development | Production (Docker)     |
| -------- | ----------- | ----------------------- |
| CSS Port | 3000        | 3000 (in container)     |
| Git Port | 2229        | Configurable            |
| Data Dir | `./data`    | `HOST_DATA_DIR` in .env |
| Proxy    | None        | Nginx or your own       |

## License

MIT

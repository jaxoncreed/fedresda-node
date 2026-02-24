# SetMeld Pod

SetMeld Pod: A Solid Pod with tools for deploying data integrations.

## Prerequisites

### Development
- Node.js ≥ 18
- Git
- OpenSSH (dev: `/usr/sbin/sshd` available on macOS & Linux)

## Development

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

- `npm run dev` — Start both server and UI concurrently
- `npm run build` — Build server and UI for production
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
   tar -xzf fedresda-node-deploy-*.tar.gz
   cd fedresda-node-deploy
   cp .env.example .env
   # Edit .env (BASE_URL, HOST_DATA_DIR, TRUST_PROXY, TRIPLESTORE_URL, etc.)
   docker compose --profile bundled-triplestore up -d
   ```

Full details, SSL options, and proxy examples are in **[deploy/README.md](./deploy/README.md)**.

## Configuration

### CSS Parameters

The Node app (Community Solid Server) supports:

- **TRUST_PROXY** — Set to `true` when behind a reverse proxy (Nginx, F5) so `X-Forwarded-For` and `X-Forwarded-Proto` are trusted.
- **TRIPLESTORE_URL** — SPARQL endpoint. Leave unset in the deploy package to use the bundled Blazegraph; set to your own URL to use an existing triplestore.
- **BASE_URL** — Public base URL of the app (e.g. `https://pod.mycompany.internal`).

All deployment configuration is driven by the `.env` file in the deploy package (see `deploy/.env.example`).

## Architecture

### Services (Docker deployment)

- **node-app** — Community Solid Server (Node.js), port 3000
- **triplestore** — Optional Blazegraph (profile `bundled-triplestore`)
- **nginx** — Optional reverse proxy (can be disabled to use your own)

### Development vs Production

| Aspect       | Development | Production (Docker)   |
|-------------|-------------|------------------------|
| CSS Port    | 3000        | 3000 (in container)    |
| Git Port    | 2229        | Configurable           |
| Data Dir    | `./data`    | `HOST_DATA_DIR` in .env|
| Proxy       | None        | Nginx or your own      |

## License

MIT

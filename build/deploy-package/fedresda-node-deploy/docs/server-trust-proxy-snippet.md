# Server snippet: reading `.env` and `trust proxy`

This project uses TypeScript and Express inside the Community Solid Server. The following shows how we read the `.env` file (via environment variables set by Docker or the shell) and apply `trust proxy` so that when the app is behind a reverse proxy (Nginx, F5, etc.), `X-Forwarded-For` and `X-Forwarded-Proto` are trusted.

## 1. Environment variables

The app does **not** load a `.env` file at runtime; the deployment supplies variables via Docker Compose `env_file: .env` and `environment:`. For local development you can use `dotenv` or export variables in the shell.

Example (Node/Express with `dotenv` in development only):

```javascript
// In development, load .env from the project root (optional)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Variables used by the app
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const trustProxy = process.env.TRUST_PROXY;
```

## 2. Trust proxy (Express)

Our Express app is mounted inside the Community Solid Server. We set `trust proxy` from the `TRUST_PROXY` environment variable so that when the server is behind a proxy, `req.ip` and `req.protocol` reflect the client.

**Snippet (from `src/createApp.ts`):**

```javascript
const express = require('express');

function applyTrustProxy(app) {
  const raw = process.env.TRUST_PROXY;
  if (raw === undefined || raw === '') return;

  const lower = raw.toLowerCase();
  if (lower === 'true' || lower === '1') {
    app.set('trust proxy', true);
    return;
  }
  if (lower === 'false' || lower === '0') {
    app.set('trust proxy', false);
    return;
  }
  const n = parseInt(raw, 10);
  if (!Number.isNaN(n) && n >= 0) {
    app.set('trust proxy', n);  // number of proxy hops to trust
  }
}

const app = express();
applyTrustProxy(app);
// ... routes, etc.
```

- **Unset / empty:** Express default (do not trust `X-Forwarded-*`).
- **`true` / `1`:** Trust the first proxy (typical for one Nginx/F5 in front).
- **`false` / `0`:** Explicitly do not trust.
- **Number:** Trust that many proxy hops.

When `trust proxy` is enabled, ensure your reverse proxy sets:

- `X-Forwarded-For`
- `X-Forwarded-Proto`

See `proxy-examples/custom-nginx.conf` for an example Nginx config.

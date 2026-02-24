#!/bin/sh
# Entrypoint for the Node app container. Builds the Community Solid Server
# command line from environment (TRIPLESTORE_URL, BASE_URL, etc.). No npm
# or network calls at runtime.

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
SPARQL="${TRIPLESTORE_URL:-http://triplestore:9999/blazegraph/sparql}"
DATA_DIR="${DATA_DIR:-/app/data}"
GIT_URI="${GIT_URI:-localhost:2229}"

# Optional: wait for the bundled triplestore when TRIPLESTORE_URL is unset
if [ -z "${TRIPLESTORE_URL}" ]; then
  wait_for_triplestore="${WAIT_FOR_TRIPLESTORE:-true}"
  if [ "$wait_for_triplestore" = "true" ]; then
    host="${SPARQL#*://}"
    host="${host%%/*}"
    host="${host%%:*}"
    port="${SPARQL#*:}"
    port="${port%%/*}"
    port="${port##*:}"
    [ -n "$port" ] || port=9999
    for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
      if node -e "require('http').get('${SPARQL}', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1));" 2>/dev/null; then
        break
      fi
      [ "$i" -eq 15 ] && exit 1
      sleep 2
    done
  fi
fi

cd /app
exec node ./node_modules/@solid/community-server/bin/server.js \
  -c ./config/config.json \
  -m ./ \
  -f "$DATA_DIR" \
  -g "$GIT_URI" \
  -s "$SPARQL" \
  -b "$BASE_URL" \
  -p 3000

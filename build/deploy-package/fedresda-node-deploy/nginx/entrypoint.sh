#!/bin/sh
# Set SSL_MODE-driven variables for default.conf.template substitution.
# Must run before envsubst (name 10-* so it runs before 20-envsubst-on-templates.sh).

set -e

# Derive NGINX_SERVER_NAME from BASE_URL if not set (e.g. https://pod.example.com -> pod.example.com)
if [ -z "${NGINX_SERVER_NAME}" ] && [ -n "${BASE_URL}" ]; then
  _host="${BASE_URL#*://}"
  _host="${_host%%/*}"
  export NGINX_SERVER_NAME="${_host}"
fi
[ -n "${NGINX_SERVER_NAME}" ] || export NGINX_SERVER_NAME=_

# Defaults for ports if not set
[ -n "${NGINX_HTTP_PORT}" ] || export NGINX_HTTP_PORT=80
[ -n "${NGINX_HTTPS_PORT}" ] || export NGINX_HTTPS_PORT=443

# When SSL_MODE=none, comment out the HTTPS server block by prefixing lines with "# "
case "${SSL_MODE:-none}" in
  none)
    export SSL_LINE_PREFIX="# "
    export SSL_CERT_PATH=/dev/null
    export SSL_KEY_PATH=/dev/null
    ;;
  custom|certbot)
    export SSL_LINE_PREFIX=""
    if [ "${SSL_MODE}" = "certbot" ]; then
      export SSL_CERT_PATH="/etc/letsencrypt/live/${NGINX_SERVER_NAME}/fullchain.pem"
      export SSL_KEY_PATH="/etc/letsencrypt/live/${NGINX_SERVER_NAME}/privkey.pem"
    else
      export SSL_CERT_PATH="${SSL_CERT_PATH:-/etc/nginx/ssl/fullchain.pem}"
      export SSL_KEY_PATH="${SSL_KEY_PATH:-/etc/nginx/ssl/privkey.pem}"
    fi
    ;;
  *)
    export SSL_LINE_PREFIX="# "
    export SSL_CERT_PATH=/dev/null
    export SSL_KEY_PATH=/dev/null
    ;;
esac

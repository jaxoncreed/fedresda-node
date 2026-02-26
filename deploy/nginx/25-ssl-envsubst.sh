#!/bin/sh
# Run after the image's 20-envsubst-on-templates.sh. The image only substitutes
# a whitelist of vars (e.g. NGINX_*), so SSL_LINE_PREFIX, SSL_CERT_PATH, SSL_KEY_PATH
# are left literal. We substitute them here.

set -e

# Derive NGINX_SERVER_NAME from BASE_URL if not set
if [ -z "${NGINX_SERVER_NAME}" ] && [ -n "${BASE_URL}" ]; then
  _host="${BASE_URL#*://}"
  _host="${_host%%/*}"
  NGINX_SERVER_NAME="${_host}"
fi
[ -n "${NGINX_SERVER_NAME}" ] || NGINX_SERVER_NAME=_

# Set SSL vars (same logic as 10-ssl-mode.sh)
case "${SSL_MODE:-none}" in
  none)
    SSL_LINE_PREFIX="# "
    SSL_CERT_PATH=/dev/null
    SSL_KEY_PATH=/dev/null
    ;;
  custom|certbot)
    SSL_LINE_PREFIX=""
    if [ "${SSL_MODE}" = "certbot" ]; then
      SSL_CERT_PATH="/etc/letsencrypt/live/${NGINX_SERVER_NAME}/fullchain.pem"
      SSL_KEY_PATH="/etc/letsencrypt/live/${NGINX_SERVER_NAME}/privkey.pem"
    else
      SSL_CERT_PATH="${SSL_CERT_PATH:-/etc/nginx/ssl/fullchain.pem}"
      SSL_KEY_PATH="${SSL_KEY_PATH:-/etc/nginx/ssl/privkey.pem}"
    fi
    ;;
  *)
    SSL_LINE_PREFIX="# "
    SSL_CERT_PATH=/dev/null
    SSL_KEY_PATH=/dev/null
    ;;
esac

export SSL_LINE_PREFIX SSL_CERT_PATH SSL_KEY_PATH
CONF=/etc/nginx/conf.d/default.conf
envsubst '${SSL_LINE_PREFIX} ${SSL_CERT_PATH} ${SSL_KEY_PATH}' < "$CONF" > "${CONF}.tmp"
mv "${CONF}.tmp" "$CONF"

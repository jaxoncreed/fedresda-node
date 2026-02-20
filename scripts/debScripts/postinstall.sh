#!/usr/bin/env bash
set -euo pipefail

log() { echo "[setmeld-postinst] $*"; }

log "Setting up SetMeld Pod"

# Create data directory and ensure setmeld user owns it
log "Setting up data directory..."
mkdir -p /var/lib/setmeld/data
chown -R setmeld:setmeld /var/lib/setmeld/data
chmod -R 755 /var/lib/setmeld/data

# Check if systemd is running as PID 1.
# This prevents errors in non-systemd environments like Docker.
if [ "$(ps -p 1 -o comm=)" = "systemd" ]; then
  echo "Reloading systemd daemon..."
  systemctl daemon-reload
  echo "Enabling and starting setmeld-pod.target..."
  systemctl enable setmeld-pod.target
  systemctl start setmeld-pod.target

  log "SetMeld Pod installation complete."
  log "Edit /etc/setmeld-pod/config.env if needed."
else
  echo "Systemd not detected, skipping service management."
fi

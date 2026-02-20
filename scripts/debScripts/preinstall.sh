#!/bin/sh
# Create a dedicated system user if it doesn't already exist.
if ! id -u setmeld >/dev/null 2>&1; then
  echo "Creating setmeld system user..."
  useradd --system \
          --shell /usr/sbin/nologin \
          --comment "SetMeld Pod User" \
          --create-home \
          setmeld
fi

# Ensure the account is unlocked
passwd -u setmeld 2>/dev/null || true
passwd -d setmeld 2>/dev/null || true

#!/bin/sh
# Clean up the user if the package is being purged
if [ "$1" = "purge" ]; then
  echo "Purging setmeld user and data..."
  userdel setmeld || echo "User setmeld could not be removed."
  rm -rf /var/lib/setmeld || echo "Data dir could not be removed."
  echo "Cleanup complete."
fi

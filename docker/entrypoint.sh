#!/bin/sh
set -e

echo "=== Starting Next.js Container ==="

# If node_modules is missing or empty, install packages with pnpm
if [ ! -d "/app/node_modules" ] || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ]; then
  echo "node_modules is missing or empty — installing pnpm packages..."
  pnpm i --frozen-lockfile --ignore-scripts
  echo "Packages installed."
else
  echo "node_modules already present, skipping install."
fi

# If RUN_FRESH is true or server.js doesn't exist, rebuild
if [ "$RUN_FRESH" = "true" ] || [ ! -f "/app/server.js" ]; then
  echo "Building Next.js app..."
  pnpm run build
  
  # Check if standalone was created
  if [ -d "/app/.next/standalone" ]; then
    echo "Copying standalone output..."
    cp -r /app/.next/standalone/. /app/
    # Also copy static files
    cp -r /app/.next/static /app/.next/static 2>/dev/null || true
    echo "Build completed."
  else
    echo "ERROR: Standalone build not found!"
    echo "Make sure output: 'standalone' is in next.config.js"
    exit 1
  fi
fi

# Verify server.js exists
if [ ! -f "/app/server.js" ]; then
  echo "ERROR: server.js not found!"
  ls -la /app/
  exit 1
fi

echo "=== Starting Next.js server ==="

# Execute the CMD passed to the container
exec "$@"

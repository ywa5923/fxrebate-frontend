#!/bin/sh
set -e

# If node_modules is missing or empty, install packages with pnpm
if [ ! -d "/app/node_modules" ] || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ]; then
  echo "node_modules is missing or empty — installing pnpm packages..."
  pnpm i --frozen-lockfile --ignore-scripts
  echo "Packages installed."
else
  echo "node_modules already present, skipping install."
fi

# If RUN_FRESH is true, rebuild the Next.js app
if [ "$RUN_FRESH" = "true" ]; then
  echo "RUN_FRESH=true — building Next.js app..."
  pnpm run build

  # Copy standalone output to the expected location
  cp -r /app/.next/standalone/. /app/
  echo "Build completed."
fi

# Execute the CMD passed to the container
exec "$@"

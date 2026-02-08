#!/bin/sh
set -e

# If node_modules is empty or missing (wiped by a volume mount),
# restore from the cached copy made during the Docker build.
if [ ! -d "/app/node_modules" ] || [ -z "$(ls -A /app/node_modules 2>/dev/null)" ]; then
  echo "node_modules is missing or empty — restoring from build cache..."
  cp -r /tmp/node_modules_cache/node_modules /app/node_modules
  echo "node_modules restored."
else
  echo "node_modules already present, skipping restore."
fi

# If RUN_FRESH is true, rebuild the Next.js app at startup
if [ "$RUN_FRESH" = "true" ]; then
  echo "RUN_FRESH=true — rebuilding Next.js app..."
  if [ -f yarn.lock ]; then
    yarn run build
  elif [ -f package-lock.json ]; then
    npm run build
  elif [ -f pnpm-lock.yaml ]; then
    corepack enable pnpm && pnpm run build
  else
    echo "Lockfile not found." && exit 1
  fi

  # Copy standalone output to the expected location
  # (.next/static and public are already in place since the build ran in /app)
  echo "Copying standalone output..."
  cp -r /app/.next/standalone/. /app/
  echo "Build completed."
fi

# Execute the CMD passed to the container
exec "$@"

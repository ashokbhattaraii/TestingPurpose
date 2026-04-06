#!/bin/sh
set -e

echo "=== WorkOps API Entrypoint ==="

# Run pending migrations against external database
echo "Checking for pending migrations..."
PENDING=$(npx prisma migrate status 2>&1 || true)

if echo "$PENDING" | grep -q "Following migration"; then
  echo "Pending migrations detected. Running prisma migrate deploy..."
  if npx prisma migrate deploy; then
    echo "Migrations applied successfully!"
  else
    echo "ERROR: Migration failed!"
    exit 1
  fi
else
  echo "No pending migrations. Database is up to date."
fi

# Generate Prisma Client (ensure it matches the schema)
echo "Generating Prisma Client..."
npx prisma generate

echo "=== Starting application ==="
exec "$@"

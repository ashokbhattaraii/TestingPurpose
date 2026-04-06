#!/bin/sh
set -e

# WorkOps Database Backup & Restore Utility
# Usage:
#   ./scripts/db-backup.sh backup          - Create a backup
#   ./scripts/db-backup.sh restore <file>  - Restore from a backup file
#   ./scripts/db-backup.sh list            - List available backups

COMPOSE_FILE="docker-compose.yaml"
CONTAINER="workops-db"
BACKUP_DIR="./backups"

mkdir -p "$BACKUP_DIR"

case "$1" in
  backup)
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/manual_backup_${TIMESTAMP}.sql"
    echo "Creating backup..."
    docker compose -f "$COMPOSE_FILE" exec -T db \
      pg_dump -U "${POSTGRES_USER:-workops}" -d "${POSTGRES_DB:-workops}" \
      --format=custom --no-owner --no-privileges \
      > "$BACKUP_FILE"
    echo "Backup saved to: $BACKUP_FILE"
    ;;

  restore)
    if [ -z "$2" ]; then
      echo "Usage: $0 restore <backup-file>"
      echo "Available backups:"
      ls -la "$BACKUP_DIR"/*.sql 2>/dev/null || echo "  No backups found"
      exit 1
    fi

    if [ ! -f "$2" ]; then
      echo "Error: Backup file '$2' not found"
      exit 1
    fi

    echo "WARNING: This will overwrite the current database!"
    printf "Are you sure? (y/N): "
    read -r confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
      echo "Aborted."
      exit 0
    fi

    echo "Stopping API to prevent connections..."
    docker compose -f "$COMPOSE_FILE" stop api

    echo "Restoring from: $2"
    cat "$2" | docker compose -f "$COMPOSE_FILE" exec -T db \
      pg_restore -U "${POSTGRES_USER:-workops}" -d "${POSTGRES_DB:-workops}" \
      --clean --if-exists --no-owner --no-privileges

    echo "Restarting API..."
    docker compose -f "$COMPOSE_FILE" start api

    echo "Restore complete!"
    ;;

  list)
    echo "Available backups in $BACKUP_DIR:"
    ls -lah "$BACKUP_DIR"/*.sql 2>/dev/null || echo "  No backups found"
    ;;

  *)
    echo "WorkOps Database Utility"
    echo "Usage: $0 {backup|restore <file>|list}"
    exit 1
    ;;
esac

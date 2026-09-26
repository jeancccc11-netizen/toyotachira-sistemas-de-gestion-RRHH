#!/usr/bin/env bash
# Backup de Postgres para SI-GHR (docker-compose o host local).
#
# Uso:      ./database/backup.sh [directorio_destino]
# Cron:     0 2 * * *  /ruta/proyecto/database/backup.sh /var/backups/sighr
#
# Requiere DATABASE_URL o DB_HOST/DB_USER/DB_PASSWORD/DB_NAME (backend/.env)
set -euo pipefail

DEST_DIR="${1:-./backups}"
STAMP="$(date +%Y%m%d_%H%M%S)"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
MAX_FILES="${BACKUP_MAX_FILES:-30}"

mkdir -p "$DEST_DIR"
OUT="$DEST_DIR/sighr_$STAMP.sql.gz"

if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^sighr-db$'; then
  # Backup vía el contenedor de docker-compose
  docker exec sighr-db pg_dump -U postgres -d postgres | gzip > "$OUT"
elif command -v pg_dump >/dev/null 2>&1; then
  # Backup directo (lee backend/.env si existe)
  if [ -f backend/.env ]; then
    set -a; . backend/.env; set +a
  fi
  if [ -n "${DATABASE_URL:-}" ]; then
    pg_dump "$DATABASE_URL" | gzip > "$OUT"
  else
    export PGPASSWORD="${DB_PASSWORD:-}"
    pg_dump -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-postgres}" | gzip > "$OUT"
  fi
else
  echo "❌ Ni docker (sighr-db) ni pg_dump disponibles" >&2
  exit 1
fi

if [ ! -s "$OUT" ]; then
  echo "❌ Backup vacío, se elimina: $OUT" >&2
  rm -f "$OUT"
  exit 1
fi

echo "✅ Backup creado: $OUT ($(du -h "$OUT" | cut -f1))"

# Retención: borra por antigüedad y limita cantidad
find "$DEST_DIR" -name 'sighr_*.sql.gz' -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true
ls -1t "$DEST_DIR"/sighr_*.sql.gz 2>/dev/null | tail -n +"$((MAX_FILES + 1))" | xargs -r rm -f

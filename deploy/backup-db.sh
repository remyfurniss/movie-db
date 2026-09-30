#!/usr/bin/env bash
# Dump the movie-db Postgres database and upload it to S3.
# Usage: BACKUP_BUCKET=my-bucket ./backup-db.sh
set -euo pipefail

: "${BACKUP_BUCKET:?set BACKUP_BUCKET}"
REGION="${AWS_REGION:-us-east-1}"
CONTAINER="${PG_CONTAINER:-movie_db_postgres}"

key="backups/moviedb-$(date -u +%Y-%m-%dT%H%M%SZ).sql.gz"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

# Dump to a local file first so a failed dump never uploads a partial backup.
# --clean --if-exists makes the dump restorable over an existing schema.
docker exec "$CONTAINER" pg_dump -U postgres --clean --if-exists moviedb | gzip > "$tmp"

aws s3 cp "$tmp" "s3://$BACKUP_BUCKET/$key" --region "$REGION" --only-show-errors
echo "Uploaded s3://$BACKUP_BUCKET/$key ($(du -h "$tmp" | cut -f1))"

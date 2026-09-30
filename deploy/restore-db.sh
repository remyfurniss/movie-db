#!/usr/bin/env bash
# Restore the movie-db database from an S3 backup made by backup-db.sh.
# Usage: BACKUP_BUCKET=my-bucket ./restore-db.sh [backups/moviedb-....sql.gz]
# With no argument, restores the most recent backup.
set -euo pipefail

: "${BACKUP_BUCKET:?set BACKUP_BUCKET}"
REGION="${AWS_REGION:-us-east-1}"
CONTAINER="${PG_CONTAINER:-movie_db_postgres}"

key="${1:-}"
if [ -z "$key" ]; then
  key="$(aws s3api list-objects-v2 --bucket "$BACKUP_BUCKET" --prefix backups/ --region "$REGION" \
    --query 'sort_by(Contents, &LastModified)[-1].Key' --output text)"
fi
if [ -z "$key" ] || [ "$key" = "None" ]; then
  echo "No backups found in s3://$BACKUP_BUCKET/backups/" >&2
  exit 1
fi

echo "Restoring s3://$BACKUP_BUCKET/$key into $CONTAINER"
aws s3 cp "s3://$BACKUP_BUCKET/$key" - --region "$REGION" \
  | gunzip \
  | docker exec -i "$CONTAINER" psql -U postgres -d moviedb -v ON_ERROR_STOP=1 --quiet
echo "Restore complete"

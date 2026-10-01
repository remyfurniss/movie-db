# Deploy & recovery

Production API (`api.remyfurniss.com`) runs on one EC2 instance in `us-east-1`
(Amazon Linux 2023): nginx + Let's Encrypt in front of the `backend` and
`postgres` containers from `docker-compose.yml`. The frontend is on CloudFront.

> `terraform/` and `k8s/` describe a Kubernetes setup and are not used by this server.

The server runs the compiled backend (`production` stage of `backend/Dockerfile`).
`~/movie-db/.env` contains `COMPOSE_FILE=docker-compose.yml` so the local-dev
`docker-compose.override.yml` is ignored there.

## What's backed up where

| What | Where |
|---|---|
| Code, nginx config, timers | this repo (`deploy/`) |
| `backend/.env` | SSM Parameter Store `/movie-db/backend-env` (SecureString) |
| Database | S3 `s3://<BACKUP_BUCKET>/backups/`, nightly via `movie-db-backup.timer` |
| Whole disk | daily EBS snapshots (Lifecycle Manager, tag `Backup=daily`, keep 7) |
| Public IP | Elastic IP |

## Rebuild the server from scratch

1. **Launch** an Amazon Linux 2023 instance with IAM role `movie-db-ec2`, key
   pair `movie-db-key`, and the existing security group (80/443 open, 22 from your IP).
2. **Move the Elastic IP** to the new instance (EC2 → Elastic IPs → Associate).
   DNS doesn't need to change.
3. **SSH in and run:**
   ```bash
   curl -fsSLO https://raw.githubusercontent.com/remyfurniss/movie-db/main/deploy/setup.sh
   CERTBOT_EMAIL=you@example.com BACKUP_BUCKET=your-bucket RESTORE_DB=1 bash setup.sh
   ```
   It installs everything, pulls `.env` from SSM, restores the latest DB backup,
   gets a certificate, installs the renewal + backup timers, and finishes by
   checking `/health`.

Faster alternative: EC2 → Snapshots → latest → *Create image from snapshot*,
launch from it, and move the Elastic IP. Everything comes back as of that snapshot.

## Day-to-day

```bash
# deploy new code (pending Prisma migrations are applied when the container starts)
cd ~/movie-db && git pull && sudo docker compose up -d --build backend

# back up now / restore latest / restore a specific one
sudo systemctl start movie-db-backup
sudo BACKUP_BUCKET=your-bucket bash deploy/restore-db.sh
sudo BACKUP_BUCKET=your-bucket bash deploy/restore-db.sh backups/moviedb-2026-10-01T180000Z.sql.gz

# check timers
systemctl list-timers certbot-renew.timer movie-db-backup.timer
```

After changing `backend/.env`, update SSM too:
```bash
aws ssm put-parameter --name /movie-db/backend-env --type SecureString --overwrite \
  --value file://$HOME/movie-db/backend/.env --region us-east-1
```

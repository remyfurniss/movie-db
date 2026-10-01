#!/usr/bin/env bash
# Rebuild the movie-db API server on a fresh Amazon Linux 2023 EC2 instance.
# See deploy/README.md for the full recovery runbook.
#
# Before running:
#   - the instance has the movie-db-ec2 IAM role (SSM + S3 backup access)
#   - its security group allows 80 and 443
#   - api.remyfurniss.com points at it (move the Elastic IP over first)
#
# Usage (as ec2-user):
#   curl -fsSLO https://raw.githubusercontent.com/remyfurniss/movie-db/main/deploy/setup.sh
#   CERTBOT_EMAIL=you@example.com BACKUP_BUCKET=your-bucket RESTORE_DB=1 bash setup.sh
#
# Safe to re-run: every step skips or updates what is already there.
set -euo pipefail

DOMAIN="${DOMAIN:-api.remyfurniss.com}"
REPO_URL="${REPO_URL:-https://github.com/remyfurniss/movie-db.git}"
APP_DIR="${APP_DIR:-$HOME/movie-db}"
REGION="${AWS_REGION:-us-east-1}"
ENV_PARAM="${ENV_PARAM:-/movie-db/backend-env}"
BACKUP_BUCKET="${BACKUP_BUCKET:-}"
RESTORE_DB="${RESTORE_DB:-0}"
: "${CERTBOT_EMAIL:?set CERTBOT_EMAIL for certificate expiry warnings}"

if [ "$RESTORE_DB" = "1" ] && [ -z "$BACKUP_BUCKET" ]; then
  echo "RESTORE_DB=1 needs BACKUP_BUCKET" >&2
  exit 1
fi

echo "==> Installing packages"
sudo dnf install -y docker git nginx

if ! command -v certbot >/dev/null; then
  # AL2023 has no certbot package, so use certbot's recommended venv install
  sudo dnf install -y python3 augeas-libs
  sudo python3 -m venv /opt/certbot
  sudo /opt/certbot/bin/pip install --quiet --upgrade pip certbot certbot-nginx
  sudo ln -sf /opt/certbot/bin/certbot /usr/bin/certbot
fi

PLUGINS=/usr/local/lib/docker/cli-plugins
sudo mkdir -p "$PLUGINS"

if ! docker compose version >/dev/null 2>&1; then
  # The AL2023 docker package doesn't include the compose plugin
  sudo curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
    -o "$PLUGINS/docker-compose"
  sudo chmod +x "$PLUGINS/docker-compose"
fi

# compose build needs buildx >= 0.17; the AL2023 docker package ships an older one
buildx_ver="$(docker buildx version 2>/dev/null | awk '{print $2}' | tr -d v)"
if [ -z "$buildx_ver" ] || [ "$(printf '%s\n' 0.17.0 "$buildx_ver" | sort -V | head -1)" != 0.17.0 ]; then
  arch="$(uname -m | sed 's/x86_64/amd64/; s/aarch64/arm64/')"
  tag="$(curl -fsSLI -o /dev/null -w '%{url_effective}' https://github.com/docker/buildx/releases/latest | sed 's#.*/##')"
  sudo curl -fsSL "https://github.com/docker/buildx/releases/download/$tag/buildx-$tag.linux-$arch" \
    -o "$PLUGINS/docker-buildx"
  sudo chmod +x "$PLUGINS/docker-buildx"
fi

sudo systemctl enable --now docker
# Lets you run docker without sudo after your next login
sudo usermod -aG docker "$USER"

echo "==> Fetching code"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> Fetching backend/.env from SSM ($ENV_PARAM)"
( umask 077
  aws ssm get-parameter --name "$ENV_PARAM" --with-decryption --region "$REGION" \
    --query Parameter.Value --output text > backend/.env )

echo "==> Starting database"
# Only postgres + backend run here; the frontend is served from CloudFront.
sudo docker compose build backend
sudo docker compose up -d postgres
for _ in $(seq 1 30); do
  sudo docker exec movie_db_postgres pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 2
done
sudo docker exec movie_db_postgres pg_isready -U postgres >/dev/null

if [ "$RESTORE_DB" = "1" ]; then
  echo "==> Restoring latest database backup"
  sudo BACKUP_BUCKET="$BACKUP_BUCKET" AWS_REGION="$REGION" bash deploy/restore-db.sh
fi

echo "==> Applying migrations and starting backend"
# docker-compose overrides the image CMD with `npm run dev`, so migrations
# don't run on container start; apply them explicitly.
sudo docker compose run --rm backend npx prisma migrate deploy
sudo docker compose up -d backend

echo "==> Configuring nginx"
sed "s/api\.remyfurniss\.com/$DOMAIN/g" deploy/nginx/api.conf | sudo tee /etc/nginx/conf.d/api.conf >/dev/null
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx

echo "==> Getting HTTPS certificate"
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect

echo "==> Installing timers"
sudo cp deploy/systemd/certbot-renew.service deploy/systemd/certbot-renew.timer /etc/systemd/system/
if [ -n "$BACKUP_BUCKET" ]; then
  sudo install -m 755 deploy/backup-db.sh /usr/local/bin/movie-db-backup
  sudo mkdir -p /etc/movie-db
  printf 'BACKUP_BUCKET=%s\nAWS_REGION=%s\n' "$BACKUP_BUCKET" "$REGION" | sudo tee /etc/movie-db/backup.env >/dev/null
  sudo cp deploy/systemd/movie-db-backup.service deploy/systemd/movie-db-backup.timer /etc/systemd/system/
fi
sudo systemctl daemon-reload
sudo systemctl enable --now certbot-renew.timer
if [ -n "$BACKUP_BUCKET" ]; then
  sudo systemctl enable --now movie-db-backup.timer
fi

echo "==> Checking https://$DOMAIN/health"
for _ in $(seq 1 30); do
  curl -fsS "https://$DOMAIN/health" >/dev/null 2>&1 && { echo "Done. API is up."; exit 0; }
  sleep 2
done
echo "API didn't respond; check: sudo docker logs movie_db_backend" >&2
exit 1

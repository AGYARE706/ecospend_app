#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
EXAMPLE_FILE="$ROOT_DIR/.env.example"

if [[ -f "$ENV_FILE" ]]; then
  echo ".env already exists at $ENV_FILE"
  echo "Delete it first if you want a fresh setup: rm .env"
  exit 0
fi

if [[ ! -f "$EXAMPLE_FILE" ]]; then
  echo "Missing $EXAMPLE_FILE"
  exit 1
fi

cp "$EXAMPLE_FILE" "$ENV_FILE"

JWT_SECRET="$(openssl rand -base64 64 | tr -d '\n')"
if [[ "$(uname)" == "Darwin" ]]; then
  sed -i '' "s|JWT_SECRET=REPLACE_WITH_openssl_rand_base64_64|JWT_SECRET=${JWT_SECRET}|" "$ENV_FILE"
else
  sed -i "s|JWT_SECRET=REPLACE_WITH_openssl_rand_base64_64|JWT_SECRET=${JWT_SECRET}|" "$ENV_FILE"
fi

echo "Created $ENV_FILE with a generated JWT_SECRET."
echo "Run: docker compose up --build"

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
EXAMPLE_FILE="$ROOT_DIR/.env.example"

get_var() {
  local key="$1"
  if [[ -f "$ENV_FILE" ]] && grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    grep "^${key}=" "$ENV_FILE" | tail -1 | cut -d= -f2-
  else
    echo ""
  fi
}

set_var() {
  local key="$1"
  local value="$2"
  local tmp

  if [[ ! -f "$ENV_FILE" ]]; then
    touch "$ENV_FILE"
  fi

  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    tmp="$(mktemp)"
    grep -v "^${key}=" "$ENV_FILE" > "$tmp"
    printf '%s=%s\n' "$key" "$value" >> "$tmp"
    mv "$tmp" "$ENV_FILE"
  else
    printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

needs_jwt_secret() {
  local current
  current="$(get_var JWT_SECRET)"
  [[ -z "$current" || "$current" == "REPLACE_WITH_openssl_rand_base64_64" ]]
}

set_default() {
  local key="$1"
  local default="$2"
  local current

  current="$(get_var "$key")"
  if [[ -z "$current" ]]; then
    set_var "$key" "$default"
    echo "Set ${key}=${default}"
    return 0
  fi
  return 1
}

if [[ ! -f "$EXAMPLE_FILE" ]]; then
  echo "Missing $EXAMPLE_FILE"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$EXAMPLE_FILE" "$ENV_FILE"
  echo "Created $ENV_FILE from .env.example"
fi

UPDATED=0

if needs_jwt_secret; then
  JWT_SECRET="$(openssl rand -base64 64 | tr -d '\n')"
  set_var JWT_SECRET "$JWT_SECRET"
  echo "Set JWT_SECRET (generated)"
  UPDATED=1
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]] && continue
  [[ "$line" != *"="* ]] && continue

  key="${line%%=*}"
  default="${line#*=}"
  [[ "$key" == "JWT_SECRET" ]] && continue

  if set_default "$key" "$default"; then
    UPDATED=1
  fi
done < "$EXAMPLE_FILE"

if [[ $UPDATED -eq 0 ]]; then
  echo ".env is ready at $ENV_FILE"
else
  echo "Updated $ENV_FILE"
fi

echo "Run: docker compose up --build"

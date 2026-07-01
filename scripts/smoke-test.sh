#!/usr/bin/env bash
set -euo pipefail

BASE="${API_BASE_URL:-http://localhost:8080}"
PHONE="024$(date +%s | tail -c 8)"

echo "=== Register ($PHONE) ==="
REGISTER=$(curl -sf -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Smoke Test\",\"phoneNumber\":\"$PHONE\",\"pin\":\"1234\"}")
echo "$REGISTER" | head -c 120
echo "..."

TOKEN=$(echo "$REGISTER" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
if [[ -z "$TOKEN" ]]; then
  echo "FAIL: no accessToken from register"
  exit 1
fi

echo "=== Push token ==="
curl -sf -X PUT "$BASE/api/users/push-token" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pushToken":"expo-smoke-test"}' > /dev/null
echo "OK"

echo "=== Upgrade to Plus ==="
UPGRADE=$(curl -sf -X POST "$BASE/api/users/upgrade-to-plus" \
  -H "Authorization: Bearer $TOKEN")
TOKEN=$(echo "$UPGRADE" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
TIER=$(echo "$UPGRADE" | sed -n 's/.*"tier":"\([^"]*\)".*/\1/p')
echo "tier=$TIER"

echo "=== Create savings goal ==="
GOAL=$(curl -sf -X POST "$BASE/api/finance/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Emergency Fund","targetAmount":5000.00}')
echo "$GOAL"

echo "=== List goals ==="
curl -sf "$BASE/api/finance/goals" -H "Authorization: Bearer $TOKEN"
echo

echo "=== Create transaction ==="
curl -sf -X POST "$BASE/api/finance/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","amount":50.00,"provider":"MTN","category":"Food"}'
echo

echo "=== PASS: full stack smoke test ==="

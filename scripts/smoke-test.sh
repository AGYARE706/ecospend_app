#!/usr/bin/env bash
set -euo pipefail

BASE="${API_BASE_URL:-http://localhost:8080}"
PHONE="024$(date +%s | tail -c 8)"
PASSWORD="password123"

echo "=== Register ($PHONE) ==="
REGISTER=$(curl -sf -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Smoke Test\",\"phoneNumber\":\"$PHONE\",\"password\":\"$PASSWORD\"}")
echo "$REGISTER" | head -c 200
echo "..."

TOKEN=$(echo "$REGISTER" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
TIER=$(echo "$REGISTER" | sed -n 's/.*"tier":"\([^"]*\)".*/\1/p')
if [[ -z "$TOKEN" ]]; then
  echo "FAIL: no accessToken from register"
  exit 1
fi
echo "tier=$TIER"

echo "=== Login ==="
LOGIN=$(curl -sf -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
echo "OK"

echo "=== GET /users/me ==="
ME=$(curl -sf "$BASE/api/users/me" -H "Authorization: Bearer $TOKEN")
echo "$ME"

echo "=== PUT /users/me ==="
curl -sf -X PUT "$BASE/api/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Updated"}' > /dev/null
echo "OK"

echo "=== Forgot password ==="
curl -sf -X POST "$BASE/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE\"}" > /dev/null
echo "OK (check identity-service logs for OTP)"

echo "=== Push token (notification-service) ==="
curl -sf -X POST "$BASE/api/notifications/tokens" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expoPushToken":"ExponentPushToken[smoke-test]","platform":"android"}' > /dev/null
echo "OK"

echo "=== Create transaction ==="
TX=$(curl -sf -X POST "$BASE/api/finance/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"EXPENSE","amount":50.00,"provider":"MTN MoMo","category":"Food","notes":"smoke"}')
TX_ID=$(echo "$TX" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
echo "tx=$TX_ID"

MONTH=$(date +%-m 2>/dev/null || date +%m)
YEAR=$(date +%Y)
echo "=== Transaction summary ($MONTH/$YEAR) ==="
curl -sf "$BASE/api/finance/transactions/summary?month=$MONTH&year=$YEAR" \
  -H "Authorization: Bearer $TOKEN"
echo

echo "=== Create savings goal + contribute ==="
GOAL=$(curl -sf -X POST "$BASE/api/finance/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Emergency Fund","targetAmount":5000.00}')
GOAL_ID=$(echo "$GOAL" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
curl -sf -X POST "$BASE/api/finance/goals/$GOAL_ID/contribute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":100.00}' > /dev/null
echo "goal=$GOAL_ID"

echo "=== Create envelope + update limit ==="
ENV=$(curl -sf -X POST "$BASE/api/finance/envelopes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"Food\",\"monthlyLimit\":500.00,\"month\":$MONTH,\"year\":$YEAR}")
ENV_ID=$(echo "$ENV" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
curl -sf -X PUT "$BASE/api/finance/envelopes/$ENV_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"monthlyLimit":600.00}' > /dev/null
echo "envelope=$ENV_ID"

echo "=== FREE personal vault (should succeed) ==="
LOCK_UNTIL=$(date -u -d "+90 days" +%Y-%m-%d 2>/dev/null || date -u -v+90d +%Y-%m-%d)
VAULT=$(curl -sf -X POST "$BASE/api/vault" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Smoke Vault\",\"targetAmount\":1000.00,\"lockedUntil\":\"$LOCK_UNTIL\"}")
echo "$VAULT" | head -c 160
echo

echo "=== FREE group vault (expect 403) ==="
HTTP=$(curl -s -o /tmp/ecospend_group.json -w "%{http_code}" -X POST "$BASE/api/vault/groups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Blocked Group\",\"targetAmount\":2000.00,\"lockedUntil\":\"$LOCK_UNTIL\",\"maxMembers\":4}")
if [[ "$HTTP" != "403" ]]; then
  echo "FAIL: expected 403 for FREE group create, got $HTTP"
  cat /tmp/ecospend_group.json || true
  exit 1
fi
echo "OK (403 GROUP_VAULT_REQUIRES_PLUS)"

echo "=== Upgrade to Plus ==="
UPGRADE=$(curl -sf -X POST "$BASE/api/users/upgrade-to-plus" \
  -H "Authorization: Bearer $TOKEN")
TOKEN=$(echo "$UPGRADE" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
TIER=$(echo "$UPGRADE" | sed -n 's/.*"tier":"\([^"]*\)".*/\1/p')
echo "tier=$TIER"

echo "=== PLUS create group vault ==="
GROUP=$(curl -sf -X POST "$BASE/api/vault/groups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Susu Smoke\",\"targetAmount\":2000.00,\"lockedUntil\":\"$LOCK_UNTIL\",\"maxMembers\":4}")
INVITE=$(echo "$GROUP" | sed -n 's/.*"inviteCode":"\([^"]*\)".*/\1/p')
echo "inviteCode=$INVITE"

echo "=== List notifications ==="
curl -sf "$BASE/api/notifications" -H "Authorization: Bearer $TOKEN" > /dev/null
echo "OK"

echo "=== Deny public /notifications/send (expect 403) ==="
SEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/notifications/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"00000000-0000-0000-0000-000000000000","title":"x","body":"y"}')
if [[ "$SEND_HTTP" != "403" ]]; then
  echo "FAIL: expected 403 for /notifications/send, got $SEND_HTTP"
  exit 1
fi
echo "OK"

echo "=== PASS: full stack smoke test ==="

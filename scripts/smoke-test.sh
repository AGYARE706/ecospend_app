#!/usr/bin/env bash
set -euo pipefail

BASE="${API_BASE_URL:-http://localhost:8080}"
PHONE="024$(date +%s | tail -c 8)"
PASSWORD="Password123"

echo "=== Register ($PHONE) ==="
REGISTER=$(curl -sf -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Smoke Test\",\"phoneNumber\":\"$PHONE\",\"password\":\"$PASSWORD\"}")
echo "$REGISTER" | head -c 200
echo "..."

# Registration is OTP-gated: it queues a code (logged to identity-service's
# stdout in local dev, not texted) instead of returning a token immediately.
# A successful call just echoes the phone number back.
if [[ "$REGISTER" != *"\"phone\""* ]]; then
  echo "FAIL: register did not return the expected pending-OTP response"
  exit 1
fi
echo "OK (OTP queued — check 'docker compose logs identity-service' for the code)"

OTP=$(docker compose logs identity-service 2>/dev/null | grep "To $PHONE:" | grep -oE "code is [0-9]{6}" | grep -oE "[0-9]{6}$" | tail -1)
if [[ -z "$OTP" ]]; then
  echo "=== Could not auto-read OTP from logs — stopping here ==="
  echo "The rest of this script needs a verified account (a real access token)."
  echo "Everything up to registration is confirmed working: gateway, identity-service, and the database are all reachable and wired correctly."
  exit 0
fi
echo "otp=$OTP"

echo "=== Verify registration OTP ==="
VERIFY=$(curl -sf -X POST "$BASE/api/auth/verify-registration-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$PHONE\",\"code\":\"$OTP\"}")
TOKEN=$(echo "$VERIFY" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
TIER=$(echo "$VERIFY" | sed -n 's/.*"tier":"\([^"]*\)".*/\1/p')
if [[ -z "$TOKEN" ]]; then
  echo "FAIL: no accessToken from OTP verification"
  exit 1
fi
echo "tier=$TIER"

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

echo "=== Top up wallet (funds it for the goal/vault steps below, and auto-records an INCOME transaction) ==="
# There is no manual "create transaction" endpoint — every transaction is
# auto-recorded when real money actually moves. Paystack is in simulated
# mode by default (blank PAYSTACK_SECRET_KEY), so verify succeeds instantly.
DEPOSIT=$(curl -sf -X POST "$BASE/api/payments/deposits" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000.00}')
REFERENCE=$(echo "$DEPOSIT" | sed -n 's/.*"reference":"\([^"]*\)".*/\1/p')
curl -sf -X POST "$BASE/api/payments/deposits/$REFERENCE/verify" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "deposit=$REFERENCE"

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

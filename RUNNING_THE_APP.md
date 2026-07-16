# Running EcoSpend Locally

A from-scratch guide to getting the whole stack — six Spring Boot microservices behind an API gateway, plus the Expo/React Native mobile app — running on your own machine, with no other help needed. Written 2026-07 against the current codebase.

## 1. What you're running

```
                         ┌──────────────────┐
   Mobile app (Expo) ──▶ │  api-gateway      │  :8080   (single entry point)
                         └─────────┬─────────┘
              ┌───────────┬────────┼─────────┬───────────────┐
              ▼           ▼        ▼          ▼               ▼
        identity-svc  expense-svc  vault-svc  payment-svc  notification-svc
           :8081         :8082      :8083       :8085          :8084
              └───────────┴────────┴──────────┴───────────────┘
                                    │
                              PostgreSQL :5432
                        (one schema per service, Flyway-owned)
```

- **api-gateway** — the only service the mobile app talks to. Validates JWTs, routes `/api/**` to the right service, and hard-blocks every `/api/**/internal/**` path (those are service-to-service only, reachable solely on the Docker network).
- **identity-service** — registration/login (phone + password), profile, PLUS tier upgrade, and (new) internal phone-number lookup used by group-vault invites.
- **expense-service** — transactions (all auto-recorded, no manual entry), savings goals, budget envelopes, income target.
- **vault-service** — personal vaults and Group Vaults ("Digital Susu"): contribution plans, majority-vote withdrawals, invites, activity log.
- **payment-service** — the central wallet. Every product (vault, goal, group vault, PLUS) moves money by debiting/crediting the wallet here. Paystack top-ups and MoMo payouts live here too.
- **notification-service** — in-app notification inbox and (server-side only, see §7) Expo push delivery.

## 2. Prerequisites

| Tool | Why | Check |
|---|---|---|
| Docker Desktop (with WSL2 backend on Windows) | Runs Postgres + all 6 backend services | `docker info` |
| Node.js 18+ and npm | Runs the Expo mobile app | `node -v` |
| A phone with Expo Go, or an Android/iOS emulator | To actually see the app | — |
| `openssl` (Git Bash on Windows already has it) | Generates the JWT secret | `openssl version` |

You do **not** need a local JDK/Maven install — the backend builds inside Docker.

## 3. First-time setup

### 3.1 Backend `.env`

From the repo root:

```bash
./scripts/setup-env.sh
```

This copies `.env.example` → `.env` and generates a random `JWT_SECRET` (the same secret is shared by `identity-service` and `api-gateway` — that's required, not optional, since the gateway verifies tokens the identity-service issues). If you're on Windows without a bash shell handy, just copy `.env.example` to `.env` by hand and replace `JWT_SECRET` with the output of:

```bash
openssl rand -base64 64 | tr -d '\n'
```

Everything else in `.env.example` has a sane default for local dev. The fields that matter:

| Variable | Purpose | Local default |
|---|---|---|
| `POSTGRES_*` | DB credentials, used by every service | `ecospend` / `ecospend_dev` |
| `JWT_SECRET` | Signs/verifies access + refresh tokens | generated above — **must** be set, the gateway refuses to boot without it |
| `JWT_EXPIRY_MS` / `JWT_REFRESH_EXPIRY_MS` | Token lifetimes | 15 min / 7 days |
| `PAYSTACK_SECRET_KEY` | Paystack test/live secret key | **blank = simulated mode** (see §6) |
| `PAYSTACK_CALLBACK_URL` | Where Paystack redirects after checkout | `ecospend://payments/callback` |
| `EXPO_ACCESS_TOKEN` | Only needed if your Expo project has "Enhanced Security for Push Notifications" turned on | blank |
| `API_BASE_URL` | Informational only, for scripts | `http://localhost:8080` |

### 3.2 Mobile `.env`

`ecospend-mobile/.env` holds one variable: where the gateway is reachable from your phone/emulator.

```
EXPO_PUBLIC_API_URL=http://<your-machine-ip>:8080
```

This is the one setting people get stuck on, because "which IP" depends on how the mobile device reaches your dev machine:

| Running the app on... | Use |
|---|---|
| Android **emulator** (AVD) | `http://10.0.2.2:8080` — the emulator's alias for the host machine |
| iOS simulator (same Mac) | `http://localhost:8080` works, since the simulator shares the host network |
| **Physical phone**, same Wi-Fi as your PC | Your PC's LAN IP, e.g. `http://192.168.1.42:8080` (find it with `ipconfig` on Windows, look for the Wi-Fi adapter's IPv4) |
| **Physical phone** tethered via Windows Mobile Hotspot | Windows' hotspot gateway IP is consistently `http://192.168.137.1:8080` — this is what's checked into `.env` today |

If `EXPO_PUBLIC_API_URL` is wrong, the app will load to the splash/login screen and then every request will silently time out — that's the #1 symptom to check first.

## 4. Running the backend

```bash
docker compose up --build
```

First run takes several minutes (Maven downloads dependencies inside each service's build). Postgres has a healthcheck, so every service waits for the DB before starting; Flyway then runs each service's migrations automatically against its own schema — you never run migrations by hand.

Confirm everything is up:

```bash
curl http://localhost:8080/api/auth/register -X POST -H "Content-Type: application/json" \
  -d '{"name":"Test User","phoneNumber":"0241111111","password":"password123"}'
```

A 200/201 with an `accessToken` in the response means the gateway, identity-service, and Postgres are all wired correctly. Or just run the bundled smoke test:

```bash
./scripts/smoke-test.sh
```

**Rebuilding after a code change:** `docker compose up --build` again — Docker only rebuilds layers that changed, so this is normally fast except after a `pom.xml`/dependency change. If you want faster iterative rebuilds and have a local JDK/Maven, there's also `docker-compose.runtime.yml`, which uses pre-built JARs instead of building inside Docker:
```bash
docker compose -f docker-compose.yml -f docker-compose.runtime.yml up --build -d
```

## 5. Running the mobile app

```bash
cd ecospend-mobile
npm install
npx expo start
```

**Known port conflict:** Expo's Metro bundler defaults to port **8081** — the same port `identity-service` listens on. If Metro fails to start or complains the port is in use, either:
- answer "yes" when Expo offers to use a different port, or
- start it explicitly on a free port: `npx expo start --port 8090`

Then:
- **Android emulator**: press `a` in the Expo CLI, or `npm run android`.
- **iOS simulator** (Mac only): press `i`, or `npm run ios`.
- **Physical device**: install Expo Go from the app store, scan the QR code Expo prints. Make sure `EXPO_PUBLIC_API_URL` (§3.2) points at an IP your phone can actually reach — same Wi-Fi network or hotspot.

The app persists whether you've seen onboarding in local storage; delete the app or clear storage to see it again.

### Test account

Register straight from the app (Login → Register), or via curl as shown in §4. Phone numbers just need to be 10 digits starting with `0` (no real SMS/OTP verification is wired up for registration — this is a local dev app, not a production auth system).

## 6. Paystack — simulated vs real

- **`PAYSTACK_SECRET_KEY` blank (default)**: payment-service runs in simulated mode. Wallet top-ups verify instantly and MoMo payouts auto-succeed. This is the easiest way to exercise every money-movement feature (vaults, goals, group vaults, PLUS upgrade) without a Paystack account.
- **Real Paystack test mode**: create a free Paystack account, grab a `sk_test_...` secret key, set `PAYSTACK_SECRET_KEY` in `.env`, and restart `payment-service`. Top-ups then open a real Paystack checkout page and only settle once you actually complete (or the webhook confirms) the test charge.
  - Caveat: the checkout redirect uses the `ecospend://payments/callback` deep link (`PAYSTACK_CALLBACK_URL`), but `ecospend-mobile/app.json` does **not** currently register an Expo `scheme`, so that deep link won't reopen the app automatically after checkout on a real device — you'd need to add `"scheme": "ecospend"` under `expo` in `app.json` (and rebuild) for that redirect to work end-to-end. Simulated mode doesn't hit this at all.

## 7. Notifications — what actually works today

- **In-app inbox** (bell icon → Notifications screen): fully functional. Every notable event across the app — group vault invites, contributions, withdrawal votes/outcomes, member joins/exits, contribution reminders, goal completion, budget-limit alerts, vault maturity, wallet top-ups, PLUS upgrade — writes a row via notification-service and shows up here, with unread badges on the bell icons and correct deep-linking when you tap one.
- **Real push notifications (to the OS notification tray) are NOT wired up on the client.** The backend genuinely supports it (`notification-service` calls the real Expo Push API whenever a device token is registered), but the mobile app never registers a real token — `registerPushTokenIfAvailable` is called with a hardcoded `null` on every sign-in. To make push actually work you'd need to:
  1. Add the `expo-notifications` package.
  2. Request notification permission and call `Notifications.getExpoPushTokenAsync()`.
  3. Pass that token into the existing (already-wired) `registerPushTokenIfAvailable` call in `AuthContext.tsx`.
  4. Rebuild with a custom **development build** (`eas build --profile development` or `expo run:android`/`expo run:ios`) — Expo Go on **SDK 54** no longer supports remote push notifications at all, so testing this requires a dev client, not Expo Go.

This was left as in-app-only deliberately for this pass: it's fully testable without extra infrastructure (no EAS project, no physical-device requirement), while push requires a dev-client rebuild that can't be verified in this environment.

## 8. Feature/tier notes

| Tier | Personal vaults | Group vaults |
|---|---|---|
| FREE | up to 3 | none |
| PLUS | unlimited | up to 10 (2–8 members each) |

PLUS costs GHS 36/year, charged from the wallet (`POST /api/users/upgrade-to-plus`) — fund the wallet first (simulated top-up, §6) if testing this on a fresh account.

## 9. Troubleshooting

**"JWT_SECRET is required" and the gateway/identity-service won't boot**
`.env` is missing or `JWT_SECRET` is still the placeholder. Re-run `./scripts/setup-env.sh` or set it by hand (§3.1).

**Mobile app hangs on splash / every request times out**
Almost always `EXPO_PUBLIC_API_URL` pointing at an unreachable address for however you're running the app — see the table in §3.2. Restart Expo (`npx expo start -c` to clear the Metro cache) after changing `.env`.

**A service exits immediately after `docker compose up`**
Check `docker compose logs <service-name>`. The most common cause is Postgres not being ready yet on the very first boot — Compose's healthcheck should prevent this, but if it still happens, `docker compose up --build` again.

**Docker Desktop / WSL2 gets into a bad state** (symptoms: `read-only file system` errors, `500 Internal Server Error` on `_ping`, or `exec format error` when a container tries to run a script that was fine a minute ago) — this happens occasionally after Docker Desktop crashes or the host sleeps mid-build. Recover in this order, without deleting any volumes:
1. Fully quit Docker Desktop.
2. `wsl --shutdown` (from PowerShell/cmd, not inside WSL).
3. Relaunch Docker Desktop and wait for it to report "running".
4. If builds still fail with odd errors (e.g. a POSIX script failing to execute), the BuildKit cache is likely corrupted: `docker builder prune -af` (safe — this only clears build cache, not your Postgres volume or images you're not actively using), then rebuild.

**Postgres data got into a bad state and you want a clean slate**
`docker compose down -v` removes the named volume (`postgres_data`) along with all data — every user, transaction, vault, etc. is gone. Only do this if you genuinely want to start over; there's no undo.

**A Flyway migration fails on startup**
Flyway refuses to start a service if a migration's checksum doesn't match what it applied before (i.e., you edited an already-applied migration file instead of adding a new one). Never edit a migration that's already run against your local DB — add a new `V{n}__description.sql` file instead. If you're in a throwaway local DB and just want to move on, `docker compose down -v` and start clean.

## 10. Where things live

```
backend/
  api-gateway/        routing + JWT auth + internal-endpoint blocking
  identity-service/    auth, profile, PLUS tier, phone lookup (internal)
  expense-service/     transactions, goals, budget envelopes
  vault-service/       personal + group vaults, contribution plans, activity log
  payment-service/     central wallet, Paystack, service-to-service money moves
  notification-service/ in-app inbox + Expo push (server-side)
ecospend-mobile/       Expo / React Native app
database/               Postgres init hook (schema creation only — Flyway owns tables)
docs/                   API contract, QA checklist, backend handoff notes
scripts/                setup-env.sh, smoke-test.sh
docker-compose.yml       primary way to run the backend
```

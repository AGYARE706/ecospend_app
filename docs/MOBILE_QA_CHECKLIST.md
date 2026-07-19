# EcoSpend — Mobile ↔ Backend QA Checklist

Branch: `feature/backend-integration-prep`  
Purpose: Verify the Expo app talks to the live Docker API gateway (not mocks).

Share this with anyone helping test. Follow **Setup** once, then work through the checklist.

---

## Prerequisites

- Docker Desktop running
- Node.js + npm installed
- Expo Go on a phone **or** Android emulator
- Phone and PC on the **same network** (shared Wi‑Fi or PC Mobile Hotspot)

---

## Setup (after hopping on this branch)

### 1. Get the code

```bash
git fetch origin
git checkout feature/backend-integration-prep
git pull
```

### 2. Start the backend

From the **repo root**:

```bash
# Preferred (faster, uses prebuilt JARs if present):
docker compose -f docker-compose.yml -f docker-compose.runtime.yml up -d

# If services fail / images missing, rebuild:
docker compose -f docker-compose.yml -f docker-compose.runtime.yml up --build -d
```

Confirm containers are up:

```bash
docker ps
```

You should see gateway, identity, expense, vault, notification, and postgres.

**Quick health check (on the PC):** open or curl:

```text
http://localhost:8080/health
```

### 3. Configure the mobile API URL

Edit `ecospend-mobile/.env` (create from `.env.example` if needed):

| How you run the app | Set `EXPO_PUBLIC_API_URL` to |
|---------------------|-----------------------------|
| Android emulator    | `http://10.0.2.2:8080` |
| iOS simulator       | `http://localhost:8080` |
| Physical phone (same Wi‑Fi / hotspot) | `http://<YOUR_PC_LAN_IP>:8080`|

**Find your PC IP (Windows):**

```powershell
ipconfig
```

- Same Wi‑Fi as phone → use the WLAN IPv4 (e.g. `192.168.1.45`)
- **PC Mobile Hotspot**, phone joined it → often `http://192.168.137.1:8080`

Example for phone + PC hotspot:

```env
EXPO_PUBLIC_API_URL=http://192.168.137.1:8080
```

No trailing slash.

**Prove phone can reach the API:** on the phone browser open:

```text
http://<YOUR_PC_IP>:8080/health
```

- Success → networking is OK
- Failure → same Wi‑Fi/hotspot, Windows Firewall allow TCP **8080**, Docker running
- Root URL `/` may show a Spring “Whitelabel” page — that still means the gateway is reachable; prefer `/health`

### 4. Start the mobile app

```bash
cd ecospend-mobile
npm install
npx expo start -c
```

- Scan QR with Expo Go, or press `a` for Android emulator
- After any `.env` change, always restart with `-c` and reload the app

### 5. Test account rules

- Use a **fresh Ghana phone number** each tester owns, e.g. `024xxxxxxx`
- Password must be **at least 8 characters**
- Database has **no demo seed data** — you create everything by registering
- Do **not** reuse old mock / seed IDs

---

## How to report results

For each failed step, note:

1. Tester name / device (iOS/Android + Expo Go version)
2. Step number
3. What you did
4. Exact error text (screenshot if possible)
5. Whether `http://<PC_IP>:8080/health` still works on the phone

Mark each step: ✅ Pass / ❌ Fail / ⏭ Skipped

---

## Checklist

### A. Auth & session

| # | Steps | Expected | Result |
|---|--------|----------|--------|
| A1 | Register: name, phone, password (≥8) | Success → Login screen | |
| A2 | Register same phone again | Clear API error (duplicate) | |
| A3 | Login with wrong password | Error shown | |
| A4 | Login with correct credentials | Enter main app | |
| A5 | Force-quit app → reopen | Still logged in | |
| A6 | Logout | Auth screens; reopen stays logged out | |
| A7 | Login again | Works | |
| A8 | Forgot password → submit phone | Reset password screen | |
| A9 | Read OTP: `docker logs ecospend-identity-service` (look for OTP) | 6-digit code in logs | |
| A10 | Reset with OTP + new password → login | New password works | |

### B. Profile & subscription

| # | Steps | Expected | Result |
|---|--------|----------|--------|
| B1 | Profile shows name & phone | Matches register | |
| B2 | Edit name → save → reload app | Name persists | |
| B3 | Open Subscription | Shows Free (before upgrade) | |
| B4 | Upgrade to Plus *(do Free vault tests in C first if possible)* | Tier becomes Plus | |

### C. Personal vaults — FREE tier

*Use a Free account. Upgrade only after C5–C6.*

| # | Steps | Expected | Result |
|---|--------|----------|--------|
| C1 | Create personal vault #1 | Created | |
| C2 | Create vaults #2 and #3 | OK | |
| C3 | Try create vault #4 | Limit / error message | |
| C4 | Open vault details | Balance, maturity, fee info visible | |
| C5 | Tap Group Vaults (Free) | Blocked / redirected to Subscription | |
| C6 | Reload app | Personal vaults still listed | |

### D. Finance (transactions)

| # | Steps | Expected | Result |
|---|--------|----------|--------|
| D1 | Add expense (amount, category, MoMo provider) | In transactions list | |
| D2 | Add income | In list | |
| D3 | Edit a transaction | Updates in list | |
| D4 | Delete a transaction | Removed | |
| D5 | Check Dashboard summary | Totals match adds | |
| D6 | Reload app | Transactions persist | |

### E. MoMo fee calculator

| # | Steps | Expected | Result |
|---|--------|----------|--------|
| E1 | Fee Calculator → MTN → amount `100` | Fee + total shown | |
| E2 | Change provider / amount | Fee updates | |
| E3 | (Optional) Stop Docker → calculate | Clear network/API error | |

### F. Savings goals

| # | Steps | Expected | Result |
|---|--------|----------|--------|
| F1 | Create goal | Appears under Active | |
| F2 | Contribute | Progress increases | |
| F3 | Contribute to completion (if easy) | Completed state/tab | |
| F4 | Edit or delete a goal | Updates / removed | |
| F5 | Reload | Goals persist | |

### G. Budget envelopes

| # | Steps | Expected | Result |
|---|--------|----------|--------|
| G1 | Create envelope (category + monthly limit) | Listed | |
| G2 | Edit monthly limit | Updates | |
| G3 | Reload | Persists | |

### H. Group vaults — PLUS only

*Upgrade to Plus (B4). Ideally use two Plus accounts for join.*

| # | Steps | Expected | Result |
|---|--------|----------|--------|
| H1 | Create group vault | Success; note **invite code** | |
| H2 | Second Plus user: Join by code → preview → join | Joins successfully | |
| H3 | Free user tries create/join group | Blocked / upgrade CTA | |
| H4 | Reload | Groups still visible | |

### I. Notifications

| # | Steps | Expected | Result |
|---|--------|----------|--------|
| I1 | Open Notifications | Loads without crash (empty OK) | |
| I2 | If items exist: mark read / dismiss / mark all | Updates, no crash | |

### J. Cross-checks

| # | Steps | Expected | Result |
|---|--------|----------|--------|
| J1 | Airplane mode → save something | Clear network error | |
| J2 | Airplane off → retry | Works | |
| J3 | Tabs: Dashboard, Transactions, Goals, Vault, Profile | No crashes | |
| J4 | Logout → login as another user | Only that user’s data | |

---

## Suggested test order (one sitting)

1. Setup + `/health` on phone
2. Register User A → Auth (A) → Profile (B1–B3)
3. Finance / Goals / Envelopes / MoMo (D–G)
4. Free vaults (C)
5. Upgrade A → Group vault create (H1)
6. Register User B (Plus) → join by code (H2)
7. Notifications + cross-checks (I–J)

---

## Pass criteria (release-ready for this branch)

- [ ] Register / login / session restore / logout work against live gateway
- [ ] Finance, goals, envelopes CRUD survive app reload
- [ ] Free: max 3 personal vaults; group vaults blocked in UI
- [ ] Plus: create group, invite code, join-by-code works
- [ ] API / network failures show real errors (no mock data)
- [ ] MoMo calculator uses live `/api/finance/momo-fee`

---

## Optional backend smoke (PC only)

From repo root (Git Bash / WSL):

```bash
./scripts/smoke-test.sh
```

Or PowerShell register smoke:

```powershell
curl -Method POST http://localhost:8080/api/auth/register `
  -ContentType "application/json" `
  -Body '{"name":"QA User","phoneNumber":"0241112222","password":"password123"}'
```

---

## Out of scope for this QA pass

- Biometrics
- Real MoMo payments / SMS auto-import
- Production deploy / merge to `main`

---

## Docs

- API contract: [`docs/API_CONTRACT_MOBILE.md`](API_CONTRACT_MOBILE.md)
- Root README: [`README.md`](../README.md)

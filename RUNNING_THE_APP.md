# EcoSpend — Complete Guide

This is your one-stop reference for EcoSpend: how to run it, what every feature does, how it's built under the hood, and how to fix the errors you're most likely to hit. Written so you can use it as your own study notes before presenting to a judging panel, and as a runbook whenever you sit down to work on the app.

Updated 2026-07-22 against the current codebase. If you change something significant later (a new service, a new screen), come back and update the relevant section.

---

## Table of Contents

1. [What EcoSpend Is](#1-what-ecospend-is)
2. [Quick Start](#2-quick-start)
3. [Architecture — The Big Picture](#3-architecture--the-big-picture)
4. [Prerequisites](#4-prerequisites)
5. [First-Time Setup](#5-first-time-setup)
6. [Running the Backend](#6-running-the-backend)
7. [Running the Mobile App](#7-running-the-mobile-app)
8. [Feature Tour — Everything the App Does](#8-feature-tour--everything-the-app-does)
9. [Technical Deep Dive (for the judging panel)](#9-technical-deep-dive-for-the-judging-panel)
10. [Environment Variables Reference](#10-environment-variables-reference)
11. [Troubleshooting — Common Errors](#11-troubleshooting--common-errors)
12. [Where Things Live](#12-where-things-live)

---

## 1. What EcoSpend Is

EcoSpend is a mobile budgeting and savings app for a Ghanaian audience (currency: Ghanaian Cedis, GHS). In plain terms, it helps someone:

- **See where their money goes** — every transaction is tracked automatically, with budgets per category.
- **Save toward a goal** — flexible savings goals (e.g. "New Laptop — GHS 3,000") that you can add to or withdraw from any time.
- **Lock money away on purpose** — "Vaults" are savings you commit to not touching until a future date, with a small penalty if you break that promise early.
- **Save as a group** — "Group Vaults" (a digital version of a traditional Ghanaian *susu*/rotating savings group), where multiple people contribute and withdrawals need a majority vote.
- **Get coached** — an AI assistant named **Abena** answers questions about your real spending data and gives you a daily insight.
- **Stay motivated** — streaks, XP, badges, and short financial-literacy lessons (a small "Duolingo for money" layer).

It's built as a set of independent backend services (a **microservices architecture**) behind a single gateway, plus a **React Native / Expo** mobile app.

### 1.1 How It's Actually Built — No Jargon

If you've never worked on an app before, here's the whole picture with no assumed knowledge.

**Two separate programs, always.** Every app like this is really two things: something that runs *on your phone* (what you actually see and tap — called the **frontend**), and something that runs on a computer somewhere else, permanently on, that the phone talks to over the internet (called the **backend**). The phone never stores your real balance or does the money math itself — it just asks the backend "what's my balance?" and displays the answer. This matters because it means your data survives even if you delete the app and reinstall it, and it means EcoSpend can't be cheated by editing something on your own phone.

**The backend isn't one program — it's seven.** Instead of one giant program doing everything, EcoSpend splits the backend into small, focused programs called **services**, each responsible for exactly one job — think of it like departments in a company: an Accounts department that only handles money, an HR department that only handles who's logged in, and so on (the full list is the table in [§3](#3-architecture--the-big-picture)). If the notifications department has a bug, the accounts department keeps working fine, because they're genuinely separate programs, not just separate files in one program.

**The gateway is the reception desk.** The phone doesn't get to walk into any department directly. Every request first hits one program called the **api-gateway** — like a building's reception desk. Reception checks your ID badge (a login token, explained next), and only then sends you to the right department. No visitor, and no phone, can walk straight into a department's back office.

**A login token is like a festival wristband.** The first time you log in, the backend checks your password once and hands back a signed, tamper-proof token (a **JWT**). From then on, the app shows that token on every request instead of your password — like getting a wristband at a festival gate after showing ID once, then just flashing the wristband to get back in all day. It can't be forged, because it's cryptographically signed by the backend.

**A database is a very organized filing cabinet.** Every service that needs to remember something permanently (your transactions, your goals, your vaults) writes it into a **database** — a program built specifically for storing and looking up structured records reliably, so nothing is lost when a service restarts. EcoSpend uses **PostgreSQL**, and — matching the "departments" idea — each service gets its own private section of the filing cabinet that only it is allowed to open directly.

**Docker containers are labeled shipping boxes.** Each of the seven backend programs, plus everything it needs to actually run (its exact language runtime, its libraries), gets packaged into a **container** — a self-contained box that runs identically on any computer. This is why setting up this whole project is one command (`docker compose up --build`) instead of manually installing seven different programs' worth of dependencies by hand.

**The mobile app is one codebase, both phones.** The app you install is built with **React Native** (via a toolchain called **Expo**) and written in **TypeScript** (a version of JavaScript that catches more mistakes before you even run the app). The point of React Native is writing the screens once and having them become a real iPhone app *and* a real Android app, instead of building and maintaining two separate apps.

---

## 2. Quick Start

If you just want it running as fast as possible:

```bash
# 1. Backend config
./scripts/setup-env.sh          # creates .env with a random JWT secret

# 2. Start the backend (all 7 services + database)
docker compose up --build

# 3. In a second terminal — mobile app
cd ecospend-mobile
npm install
npx expo start
```

Then set `ecospend-mobile/.env` to point at your machine (see [§5.2](#52-mobile-env)), and open the app in Expo Go or an emulator.

Everything below explains each of these steps in more depth, plus what to do when something goes wrong.

---

## 3. Architecture — The Big Picture

```
                         ┌──────────────────┐
   Mobile app (Expo) ──▶ │  api-gateway      │  :8080   (single entry point)
                         └─────────┬─────────┘
        ┌───────────┬──────────┬───┴──────┬─────────────┬────────────────┐
        ▼           ▼          ▼          ▼              ▼                ▼
   identity-svc  expense-svc  vault-svc  payment-svc  notification-svc  engagement-svc
      :8081        :8082       :8083       :8085          :8084             :8086
        └───────────┴──────────┴──────────┴──────────────┴────────────────┘
                                        │
                                  PostgreSQL :5432
                        (one schema per service, Flyway-owned)
```

**Why microservices, not one big app?** Each service owns one job and its own database schema — nothing outside `vault-service` can touch vault tables directly, for example. This makes each piece independently testable and means a bug in one service (say, notifications) can't corrupt another's data. It also mirrors how real fintech backends are usually built, which is worth mentioning to a judging panel.

| Service | Port | Job |
|---|---|---|
| **api-gateway** | 8080 | The *only* service the mobile app talks to. Checks the login token (JWT) on every request, forwards it to the right service, and blocks any `/internal/**` path from ever being reached by a phone — those routes are for services to call each other only. |
| **identity-service** | 8081 | Registration, OTP verification, login, 2FA, session/device tracking, password reset, profile, PLUS-tier upgrade. |
| **expense-service** | 8082 | Transactions (all auto-recorded — there's no manual "add expense" form), savings goals, budget envelopes, monthly income target, and the AI Coach (Abena). |
| **vault-service** | 8083 | Personal vaults (locked savings) and Group Vaults (susu-style group savings). |
| **payment-service** | 8085 | The central wallet. Every feature that moves money (goals, vaults, group vaults, PLUS upgrade) does it by debiting/crediting the wallet here. Also owns Paystack top-ups and mobile-money (MoMo) payouts. |
| **notification-service** | 8084 | The in-app notification inbox, and (server-side) real push notification delivery via Expo's push API. |
| **engagement-service** | 8086 | Streaks, XP, badges, and the "Learn" financial-literacy lessons. |

The mobile app **never** calls these services directly — it only ever talks to `api-gateway` on port 8080, which is why that's the one URL you configure on the phone side.

**Tech stack, one line each:**
- **Backend:** Java 21, Spring Boot 3.2.5, Spring Cloud Gateway (the api-gateway), Spring Data JPA/Hibernate, PostgreSQL 16, Flyway (database migrations), Maven, all running in Docker containers via Docker Compose.
- **Mobile:** Expo (SDK 54) / React Native, TypeScript, React Navigation, React Context for state (no Redux).
- **AI:** Google Gemini via its `generateContent` REST API, powering Abena's chat and daily-insight features.

---

## 4. Prerequisites

| Tool | Why | Check it's installed |
|---|---|---|
| Docker Desktop (WSL2 backend, on Windows) | Runs Postgres + all 7 backend services | `docker info` |
| Node.js 18+ and npm | Runs the Expo mobile app | `node -v` |
| A phone with Expo Go installed, or an Android/iOS emulator | To actually see the app | — |
| `openssl` (Git Bash on Windows already has it) | Generates the login-token secret | `openssl version` |

You do **not** need a local Java/Maven install — the backend builds entirely inside Docker.

---

## 5. First-Time Setup

### 5.1 Backend `.env`

From the repo root:

```bash
./scripts/setup-env.sh
```

This copies `.env.example` → `.env` and generates a random `JWT_SECRET`. That secret is shared between `identity-service` (which issues login tokens) and `api-gateway` (which checks them) — they must match, it's not optional.

No bash shell handy? Copy `.env.example` to `.env` by hand and set `JWT_SECRET` to the output of:

```bash
openssl rand -base64 64 | tr -d '\n'
```

Everything else in `.env.example` already has a safe default for local development. See [§10](#10-environment-variables-reference) for the full list.

### 5.2 Mobile `.env`

`ecospend-mobile/.env` holds one important line — where your phone can reach the gateway:

```
EXPO_PUBLIC_API_URL=http://<your-machine-ip>:8080
```

This is the single most common setup mistake, because "which IP" depends on how your phone reaches your computer:

| Running the app on... | Use |
|---|---|
| Android **emulator** (AVD) | `http://10.0.2.2:8080` — the emulator's special alias for your computer |
| iOS simulator (Mac only) | `http://localhost:8080` — the simulator shares your Mac's network |
| **Physical phone**, same Wi-Fi as your PC | Your PC's Wi-Fi IP, e.g. `http://192.168.1.42:8080` — find it by running `ipconfig` (Windows) and looking at the Wi-Fi adapter's "IPv4 Address" |
| **Physical phone** tethered via Windows' Mobile Hotspot (phone joins a hotspot your laptop is broadcasting) | The hotspot's gateway IP, consistently `http://192.168.137.1:8080` on Windows |

If this is wrong, the app loads fine to the login screen, but every button that talks to the server just spins or times out silently. That's the #1 thing to check when nothing works.

---

## 6. Running the Backend

```bash
docker compose up --build
```


First run takes a few minutes — each service downloads its own dependencies and compiles inside its container. Postgres has a startup health check, so every other service automatically waits for the database before starting. Database tables are created automatically too, via Flyway migrations — you never run SQL by hand.

**Confirm it worked:**

```bash
curl http://localhost:8080/api/auth/register -X POST -H "Content-Type: application/json" \
  -d '{"name":"Test User","phoneNumber":"0241111111","password":"password123"}'
```

A response mentioning OTP verification (not a connection error) means the gateway, identity-service, and database are all wired up correctly. Or just run:

```bash
./scripts/smoke-test.sh
```

**Rebuilding after a code change:** run `docker compose up --build` again — Docker only rebuilds what changed, so this is fast except after touching a `pom.xml` (dependency change). If you have a local JDK/Maven and want faster rebuilds, there's a "runtime" override that uses pre-built JAR files instead of compiling inside Docker:

```bash
docker compose -f docker-compose.yml -f docker-compose.runtime.yml up --build -d
```

⚠️ **About that command specifically** — see [§11](#11-troubleshooting--common-errors) if you hit a "port 8081 already in use" error running it; that's a known, easy-to-fix conflict with Expo's dev server, not a bug in this override.

---

## 7. Running the Mobile App

```bash
cd ecospend-mobile
npm install
npx expo start
```

**Known port conflict:** Expo's dev server (called "Metro") defaults to port **8081** — the same port `identity-service` uses. If Metro complains the port is taken, either let it offer you a different port (press "y"), or start it explicitly elsewhere:

```bash
npx expo start --port 8090
```

Then:
- **Android emulator** — press `a` in the terminal, or `npm run android`.
- **iOS simulator** (Mac only) — press `i`, or `npm run ios`.
- **Physical device** — install **Expo Go** from your app store, scan the QR code the terminal prints. Double-check `EXPO_PUBLIC_API_URL` first ([§5.2](#52-mobile-env)).

**If Metro crashes with "out of memory" while bundling** (can happen on machines with limited RAM): restart it with a single worker:
```bash
npx expo start --max-workers 1
```

### Test account

Register straight from the app (Login → Register). You'll be asked for a phone number (10 digits, starting with `0`) and a password (min. 8 characters), then sent an OTP code — in local development, that code is printed to the `identity-service` container logs (`docker compose logs identity-service`) rather than sent as a real SMS, since there's no SMS provider wired up for local dev.

---

## 8. Feature Tour — Everything the App Does

This section is written so you (or a judge) can understand every corner of the app without reading code.

### 8.1 Onboarding & Authentication

- **Splash → Onboarding → Register/Login.** First-time users see a short onboarding sequence, then register with phone + password.
- **OTP verification.** Both registration and login require a one-time code sent after the phone+password step (`verify-registration-otp` / `verify-login-otp`). Codes can be resent. This is real backend logic — it's not just a UI mock — but in local dev the code is logged to the console instead of texted.
- **2FA (two-factor authentication).** Users can turn on an extra verification step for logins from the Profile → Security screen.
- **Login lockout.** Repeated failed login attempts lock the account temporarily — a basic brute-force defense.
- **Sessions & device history.** The app tracks which devices you've logged in from and when (Profile → Security → login history / active sessions), and lets you see/revoke them.
- **App lock.** A local Face ID / fingerprint / device-passcode lock screen that guards the app itself after it's already logged in (separate from the login password) — it's **on by default** the moment a device has any screen lock set up, and re-engages every time the app is reopened or comes back from the background. It can be turned off from Profile → Security.
- **Setup wizard.** After first login: set your expected monthly income, set up starter budget envelopes, and choose notification preferences.

### 8.2 Wallet & Transactions

- The **wallet** is the one place your real money sits. You top it up (via Paystack) and every other feature — goals, vaults, bills — moves money in or out of it.
- **Topping up opens Paystack's real checkout inside the app** (an in-app browser tab, not your phone's separate Safari/Chrome app), and closes itself and returns you straight to EcoSpend the moment the payment finishes — no manual switching back and forth.
- **Transactions are never entered by hand.** Every wallet movement (a top-up, a goal contribution, a bill payment, a vault deposit) automatically writes a transaction record. This keeps spending reports trustworthy — there's no way to fake or edit history.
- **Send Money** — send wallet funds to any mobile-money (MoMo) number, including your own (a handy way to "cash out" without going through a bank).
- **Bills** — set up recurring bills that get paid from the wallet.

### 8.3 Budgeting

- **Budget envelopes** — a monthly spending limit per category (e.g. "Food: GHS 400/month"). The dashboard shows a compact progress bar per category, live-updated from your real transactions.
- **Income target** — set what you expect to earn monthly; the app compares it against actual recorded income.
- **Weekly insights** — a summary card showing how the week went.

### 8.4 Savings Goals

Flexible, no-penalty savings for something specific (e.g. a laptop, a trip).

- No lock period, no fee — contribute or withdraw anytime, in any amount, as long as you don't go over the target.
- **You cannot contribute more than the goal needs.** If you try to add more than the remaining amount to reach the target, the app rejects it and tells you the exact amount you're allowed to enter — it won't silently trim your input.
- **Completion is permanent.** Once a goal's `currentAmount` reaches its `targetAmount`, it's marked complete (with a small confetti celebration) and **can never accept another contribution again**, even if you later raise the target amount. It just sits there, "done." You can still withdraw from it, or start a fresh goal.
- Editing a goal (its name, target, or deadline) is separate from contributing — it never touches the amount you've actually saved.

### 8.5 Personal Vaults

Vaults are for savings you deliberately want to be *hard to touch* before a chosen date — the whole point is the commitment.

- **You choose an amount and an unlock date** when creating a vault.
- **You cannot withdraw before that date**, no matter what — not even if you've already hit your savings target early. The app tells you this clearly when you create the vault, so there's no surprise later.
- **You cannot deposit more than the vault's target**, same rule as goals — trying to overshoot gets rejected with a clear message, and once you're already at the target, no further deposits are accepted at all.
- Reaching the target early still shows a small celebration, but it explicitly says the vault stays locked — there's no "cash out now" shortcut, because that would defeat the purpose of a vault.
- **Three fee tiers apply when you eventually withdraw**, always shown up front before you confirm anything:

  | Situation | Fee |
  |---|---|
  | On time, and you hit your target | **2%** |
  | On time, but you *didn't* hit your target (the date came, the goal didn't) | **4%** |
  | You break the vault open **before** the unlock date | **5%** |

  The idea: the fee rewards keeping your commitment (lowest fee) and penalizes breaking the promise early (highest fee) more than just missing the target on time.

### 8.6 Group Vaults ("Digital Susu")

A group version of a vault — several people save toward one pot together, modeled on a traditional Ghanaian rotating-savings group.

- One person creates the group vault (with a target, a lock date, and 2–8 member slots) and invites others by phone number.
- Each member contributes independently; the app tracks each person's own contribution.
- **Withdrawals need a majority vote.** Anyone can *request* a withdrawal (their own contributed amount only), other members vote to approve or reject it, and it only executes once enough votes are in.
- The same three-tier fee structure as personal vaults applies to the payout, based on whether the group hit its target and whether the vote executes before or after the lock date — this closes a loophole that used to let a majority vote bypass the vault's time-lock cheaper than the intended early-exit penalty.
- A full activity log (joins, exits, contributions, votes, payouts) is visible to every member.

### 8.7 AI Coach — "Abena"

- A conversational AI assistant, reachable from the floating chat button on the dashboard or the "Ask Coach" screen.
- Abena is grounded in your **real data** — it has tools it can call to look up your actual spending summary, budget status, recent transactions, goals progress, income target, and vault summary before answering. It's told never to make up a number it hasn't actually looked up.
- **Daily Insight** — a short, auto-generated one-liner on the dashboard summarizing something useful about your spending that day.
- Powered by **Google Gemini** (free tier via [aistudio.google.com](https://aistudio.google.com/apikey), no credit card required). If no `GEMINI_API_KEY` is configured, the feature quietly disables itself (the endpoints return "service unavailable" and the mobile UI hides the coach) rather than breaking anything else.

### 8.8 Engagement / "Learn"

A light gamification layer to encourage regular use:

- **Streaks** — counts consecutive days you've been active in the app.
- **XP and badges** — earned by doing things in the app (creating a goal, hitting a savings target, logging in daily, etc.).
- **Lessons** — short financial-literacy lessons with a quiz at the end; completing one earns XP.

### 8.9 Notifications

- **In-app inbox** (bell icon) — every notable event (a goal completed, a vault matured, a group-vault vote outcome, a budget limit hit, a wallet top-up, and more) shows up here, with unread badges and correct navigation when you tap one. This is fully working end-to-end.
- **Real push notifications** (to the phone's OS notification tray, outside the app) are supported on the *backend* — `notification-service` can genuinely call Expo's push API — but the mobile app doesn't yet register a real device token to receive them. This is a known, deliberate gap for this version (documented so it isn't mistaken for a bug): wiring it up needs the `expo-notifications` package, a permission prompt, and a custom "development build" instead of the plain Expo Go app, since Expo Go on SDK 54 no longer supports remote push at all.

### 8.10 PLUS Subscription Tier

| Tier | Personal vaults | Group vaults |
|---|---|---|
| FREE | up to 3 | none |
| PLUS | unlimited | up to 10 (2–8 members each) |

PLUS costs **GHS 36/year**, paid straight from the wallet (so top up the wallet first if testing this). Upgrading always shows a confirmation dialog stating the exact amount first — nothing is charged until you confirm a second time.

---

## 9. Technical Deep Dive (for the judging panel)

Things worth being able to explain clearly if asked "how does this actually work":

### 9.1 Why a gateway, and what does it actually enforce?

The mobile app never has direct network access to any backend service except `api-gateway`. The gateway:
1. Validates the JWT (JSON Web Token — a signed, tamper-proof login token) on every request except `/auth/**` (login/register, which obviously can't require being already logged in).
2. Reads the user's ID out of that verified token and forwards it to the target service as a plain header (`X-User-Id`).
3. **Blocks every `/internal/**` route from ever reaching a phone.** Those routes exist purely for services to call each other (e.g. payment-service telling vault-service "credit this deposit") and would be dangerous if a phone could call them directly — they trust the caller completely, with no re-checking of identity.

This means every backend service *inside* the Docker network implicitly trusts the `X-User-Id` header it receives, because the only way to reach them is through the gateway, which only sets that header after verifying a real signed token. This is a standard "trust boundary" pattern in gateway-fronted microservice systems, and it's worth explicitly naming if asked about security.

### 9.2 How money movement stays consistent across services

Since the wallet lives in `payment-service` but goals/vaults/bills live elsewhere, every money-moving action follows the same pattern:
1. The owning service (say, `expense-service` for a goal contribution) validates the request.
2. It calls `payment-service` to actually debit/credit the wallet, passing a **unique reference string** it generates itself.
3. `payment-service` treats that reference as an idempotency key — if the same reference is ever sent twice (e.g. a retried network request), it returns the original result instead of moving money twice.

This means a flaky network retry can never double-charge or double-credit a user, which is the central correctness property you want in any system that moves real money.

### 9.3 Sticky completion state (goals & vaults)

A subtle correctness bug this project deliberately fixed: what happens if a completed goal is later partly withdrawn from? Naively recomputing "is it complete?" from `currentAmount >= targetAmount` on every read would make it flicker between complete/incomplete. Instead, goals store a one-way `completedAt` timestamp — once set, it's *never* cleared, even by a withdrawal or a target change. "Complete" is a permanent milestone, not a live computed toggle. This is what makes the "once complete, no more contributions, ever" rule (§8.4) actually hold up under editing and withdrawing.

### 9.4 Fee-tier design (vaults)

The three-tier vault fee system (§8.5) exists to close a real logical gap: a flat "2% withdrawal fee" regardless of timing would make an early group-vote withdrawal *cheaper* than the intentional early-exit penalty, defeating the purpose of locking money at all. Tying the fee to *both* "on time?" and "hit the target?" makes the incentives line up with what a vault is supposed to guarantee.

### 9.5 Database-per-service via schemas

All services share one physical Postgres instance (simpler to run locally), but each owns its **own schema** (e.g. `vault_schema`, `expense_schema`) and only that service's Flyway migrations touch it. No service reaches into another's tables directly — if `expense-service` needs vault data, it calls `vault-service` over HTTP, never queries its tables. This keeps the "microservices" boundary real even though they share one database server for local-dev simplicity.

### 9.6 AI tool-use loop (Abena)

Abena isn't just "send the question to an LLM." The chat flow is a manual tool-use loop:
1. The user's message + conversation history is sent to Gemini along with a list of available "tools" (functions) it can call — get spending summary, get budget status, list transactions, etc.
2. If Gemini's response is a request to call one or more tools (a `functionCall` part), the backend actually executes them against the real database and sends the results back to Gemini.
3. This repeats (capped at a few iterations) until Gemini responds with a plain text answer instead of another tool call.

This is what "grounds" the AI in real numbers instead of letting it guess — worth explaining if a judge asks how you prevented the AI from hallucinating financial figures.

### 9.7 Key non-functional facts

- **Language/runtime:** Java 21 (backend), TypeScript (mobile).
- **Migrations:** Flyway — every schema change is a numbered, checked-in SQL file (`V6__something.sql`); Flyway refuses to start if an already-applied file's contents ever change, which is what keeps the migration history trustworthy.
- **Containerization:** every backend service ships as its own Docker image; `docker-compose.yml` orchestrates all of them plus Postgres for local development.
- **No ORM leakage across services** — each service's JPA entities are private to it.

---

## 10. Environment Variables Reference

### Backend `.env`

| Variable | Purpose | Local default |
|---|---|---|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Database credentials, used by every service | `ecospend` / `ecospend` / `ecospend_dev` |
| `JWT_SECRET` | Signs and verifies login tokens | **required** — generated by `setup-env.sh`, gateway refuses to boot without it |
| `JWT_EXPIRY_MS` / `JWT_REFRESH_EXPIRY_MS` | How long login tokens last | 15 min / 7 days |
| `PAYSTACK_SECRET_KEY` | Paystack (payments provider) secret key | **blank = simulated mode** — see §11 |
| `PAYSTACK_CALLBACK_URL` | Fallback for where Paystack redirects after checkout | `ecospend://payments/callback` — the app now sends its own actual redirect link with every top-up request (Expo Go and a standalone build resolve to different URL schemes, so it can't be hardcoded); this value is only used if the app doesn't send one |
| `PAYSTACK_TRANSFERS_SIMULATED` | Whether Send Money (MoMo payouts) simulates instead of calling real Paystack transfers | **`true` by default** — independent of `PAYSTACK_SECRET_KEY`. Paystack rejects third-party payouts outright for a "Starter" business (account/KYC restriction, no code workaround), so payouts simulate even with a real key configured, while deposits still hit real Paystack. Set to `false` once the Paystack business is verified as Registered |
| `GEMINI_API_KEY` | Powers the Abena AI coach (Google Gemini) | blank = coach feature disabled, nothing else breaks. Free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey), no card required |
| `GEMINI_MODEL` | Gemini model id for the coach | optional, defaults to `gemini-flash-lite-latest` |
| `EXPO_ACCESS_TOKEN` | Only needed if your Expo project has "Enhanced Security for Push Notifications" turned on | blank |
| `*_SERVICE_PORT` (e.g. `IDENTITY_SERVICE_PORT`) | Which **host** port each service is reachable on | matches the port table in §3 |

### Mobile `ecospend-mobile/.env`

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | The one URL the app calls — must point at your `api-gateway` (see §5.2 for which IP to use) |

---

## 11. Troubleshooting — Common Errors

### "ports are not available: ... bind: Only one usage of each socket address..." (e.g. on port 8081)

**Not a big deal — just two programs fighting over the same port.** Port 8081 is used by both `identity-service` (in Docker) and Expo's Metro dev server (on your host machine) by default. If Metro is already running when you start Docker (or vice-versa), whichever started second fails to bind.

Fix, pick one:
- Stop whichever thing is using it. On Windows, find it with:
  ```powershell
  Get-NetTCPConnection -LocalPort 8081 | Select OwningProcess
  Get-Process -Id <that PID>
  ```
  If it's a leftover `node.exe`, closing that terminal (or `Stop-Process -Id <PID> -Force`) frees the port.
- Or just never run them on the same port: start Metro with `npx expo start --port 8090` instead of the default.
- Or permanently avoid the clash: set `IDENTITY_SERVICE_PORT=8091` (or any free port) in `.env` and restart the backend. This only changes which port your *host machine* uses to reach identity-service directly — the gateway and other services always talk to it over Docker's internal network on port 8081 regardless, so this is completely safe.

### "JWT_SECRET is required" and the gateway/identity-service won't boot

`.env` is missing, or `JWT_SECRET` was never set. Re-run `./scripts/setup-env.sh`, or set it by hand (§5.1).

### Mobile app hangs on splash / every request times out or spins forever

Almost always `EXPO_PUBLIC_API_URL` pointing somewhere your phone can't actually reach — see the table in §5.2. After changing `.env`, restart Expo with a cleared cache: `npx expo start -c`.

### A backend service exits immediately after `docker compose up`

Check its logs: `docker compose logs <service-name>`. The most common cause is Postgres not being ready on the very first boot — the compose file's health check should prevent this, but if it still happens, just run `docker compose up --build` again.

### Metro bundler crashes with "out of memory" / "Data cannot be cloned, out of memory"

Happens on machines with limited RAM during bundling. Restart with a single worker:
```bash
npx expo start --max-workers 1
```
(same fix applies to `npx expo export`, if you ever run that directly).

### Docker Desktop / WSL2 gets into a bad state

Symptoms: `read-only file system` errors, `500 Internal Server Error` on `_ping`, or a container failing to run a script that worked a minute ago. This happens occasionally after Docker Desktop crashes, the host sleeps mid-build, or **your C: drive runs out of free space** (Docker's virtual disk needs headroom to write to). Recover in this order, without deleting your data:
1. Free up disk space if you're low (check with `Get-PSDrive C` in PowerShell) — this is the most common root cause.
2. Fully quit Docker Desktop (right-click its tray icon → Quit, or force-stop its processes if it's stuck).
3. `wsl --shutdown` (from PowerShell, not inside WSL).
4. Relaunch Docker Desktop and wait for it to report "running" (can take a minute or two after a disk-space issue).
5. If builds still fail oddly afterward, the build cache may be corrupted: `docker builder prune -af` (safe — only clears build cache, not your database or existing images).

### Postgres data is in a bad state and you want a clean slate

```bash
docker compose down -v
```
This deletes the database volume — every user, transaction, goal, vault, everything. Only do this if you genuinely want to start over; there's no undo.

### A Flyway migration fails on startup ("checksum mismatch")

Flyway refuses to start a service if a migration file it already applied has since been *edited*. Never edit a migration file that's already run against your database — always add a new `V{n}__description.sql` file instead. If you're on a throwaway local database and just want to move on: `docker compose down -v` and start fresh.

### Send Money fails with "you cannot initiate third party payouts as a starter business"

That's Paystack itself talking, not a bug — third-party payouts (money going *out* to someone else's MoMo number) are blocked entirely for any Paystack business still on the "Starter" tier; only a KYC-verified "Registered Business" can transfer out. Deposits (top-ups) are unaffected — that restriction is deposit-only. `PAYSTACK_TRANSFERS_SIMULATED` (default `true`, see §10) works around this for local dev/demos by simulating just the MoMo transfer leg while deposits keep hitting real Paystack; flip it to `false` once the Paystack business is verified.

### The AI Coach (Abena) returns a "service unavailable" or quota error

- **503 / "not configured"** — `GEMINI_API_KEY` is blank in `.env`. This is expected behavior, not a bug, if you haven't set up a key.
- **401/403 / "API key not valid" or "permission denied"** — the key is wrong, disabled, or restricted; check it at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
- **404 "model not found"** — your key can't access the configured model; set `GEMINI_MODEL` in `.env` (or `gemini.chat-model` in `expense-service`'s `application.yml`) to a model your key supports — `gemini-flash-lite-latest` is free-tier eligible and the default.
- **429 "quota exceeded"** — the free tier's per-minute/per-day request cap was hit; wait a bit or check usage at [aistudio.google.com](https://aistudio.google.com).

### Registering/logging in seems to hang waiting for an OTP code

There's no real SMS provider wired up for local development — the OTP code is printed to the `identity-service` container's logs instead of texted to a phone:
```bash
docker compose logs identity-service --tail 50
```
Look for the code in there.

---

## 12. Where Things Live

```
backend/
  api-gateway/          routing + login-token verification + internal-endpoint blocking
  identity-service/     auth (OTP, 2FA, sessions), profile, PLUS tier
  expense-service/      transactions, budgets, savings goals, AI Coach (Abena)
  vault-service/        personal + group vaults, fee logic, activity log
  payment-service/      central wallet, Paystack, MoMo payouts, service-to-service transfers
  notification-service/ in-app inbox + Expo push (server-side)
  engagement-service/   streaks, XP, badges, Learn lessons
  user-service/         DEPRECATED — do not run, kept only for reference (see its DEPRECATED.md)
ecospend-mobile/        the Expo / React Native app (all screens under src/screens/)
database/               Postgres init hook (schema creation only — Flyway owns the tables)
docs/                   API contract notes, QA checklist, backend handoff notes
scripts/                setup-env.sh, smoke-test.sh
docker-compose.yml       primary way to run the backend
docker-compose.runtime.yml   faster local override (pre-built JARs instead of Docker-side Maven builds)
```

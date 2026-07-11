# EcoSpend Mobile — API Contract

Gateway base URL: `http://localhost:8080` (Android emulator: `http://10.0.2.2:8080`)

All protected routes require `Authorization: Bearer <accessToken>`.  
The gateway injects `X-User-Id` and `X-User-Tier` for downstream services.

Auth credentials: **phone + password** (min 8 chars). Register includes **name**.

---

## Auth (`/api/auth/**` — open)

| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | `/api/auth/register` | `{ phoneNumber, password, name }` | `AuthResponse` 201 |
| POST | `/api/auth/login` | `{ phoneNumber, password }` | `AuthResponse` |
| POST | `/api/auth/refresh` | `{ refreshToken }` | `AuthResponse` |
| POST | `/api/auth/logout` | `{ refreshToken }` | 204 |
| POST | `/api/auth/forgot-password` | `{ phoneNumber }` | `{ phone }` |
| POST | `/api/auth/reset-password` | `{ phoneNumber, code, password }` | `{ success: true }` |

**AuthResponse**

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "tier": "FREE",
  "user": { "name": "Kofi Mensah", "phone": "0244123456" }
}
```

Phone format: `0XXXXXXXXX` or `+233XXXXXXXXX`. OTP is 6 digits.

---

## Users (`/api/users/**` — JWT)

| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/users/me` | — | `{ id, name, phone, tier, createdAt }` |
| PUT | `/api/users/me` | `{ name }` | same as GET |
| PUT | `/api/users/push-token` | `{ pushToken }` | 200 |
| POST | `/api/users/upgrade-to-plus` | — | `AuthResponse` (new access token + PLUS tier) |

Mobile mapping: `phone` ← `phoneNumber`, `tier` ← `subscriptionTier`.

---

## Finance (`/api/finance/**` — JWT)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/finance/momo-fee?amount=&provider=` | Fee utility |
| POST | `/api/finance/transactions` | Create |
| GET | `/api/finance/transactions` | List |
| GET | `/api/finance/transactions/summary?month=&year=` | `{ totalIncome, totalExpense, netBalance, transactionCount }` |
| GET | `/api/finance/transactions/{id}` | Get one |
| PUT | `/api/finance/transactions/{id}` | Update |
| DELETE | `/api/finance/transactions/{id}` | 204 |
| POST | `/api/finance/goals` | Create |
| GET | `/api/finance/goals` | List |
| PUT | `/api/finance/goals/{id}` | Update |
| DELETE | `/api/finance/goals/{id}` | 204 |
| POST | `/api/finance/goals/{id}/contribute` | `{ amount }` |
| POST | `/api/finance/envelopes` | Create (`monthlyLimit` → `budgetLimit`) |
| GET | `/api/finance/envelopes` | List |
| PUT | `/api/finance/envelopes/{id}` | `{ monthlyLimit }` |

---

## Vault (`/api/vault/**` — JWT + tier policy)

| Tier | Personal vaults | Group vaults |
|------|-----------------|--------------|
| FREE | max 3 | none (403 `GROUP_VAULT_REQUIRES_PLUS`) |
| PLUS / PREMIUM | unlimited | max 10 memberships |

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/vault` | Create personal |
| GET | `/api/vault` | List personal |
| GET | `/api/vault/{id}` | Get |
| POST | `/api/vault/{id}/deposit` | `{ amount }` |
| POST | `/api/vault/{id}/withdraw` | Mature withdraw (2%) |
| POST | `/api/vault/{id}/break` | Early break (5%) |
| DELETE | `/api/vault/{id}` | Delete |
| POST | `/api/vault/groups` | Create (Plus); returns `inviteCode` |
| GET | `/api/vault/groups` | List |
| GET | `/api/vault/groups/by-code/{code}` | Preview before join |
| POST | `/api/vault/groups/join` | `{ inviteCode }` |
| POST | `/api/vault/groups/{id}/join` | Join by UUID (legacy) |
| POST | `/api/vault/groups/{id}/deposit` | `{ amount }` |
| POST | `/api/vault/groups/{id}/withdrawals` | Request withdrawal |
| POST | `/api/vault/groups/{id}/withdrawals/{requestId}/vote` | `{ approve }` |

---

## Notifications (`/api/notifications/**` — JWT)

Prefer **notification-service** for Expo tokens:

| Method | Path |
|--------|------|
| POST | `/api/notifications/tokens` |
| DELETE | `/api/notifications/tokens/{expoPushToken}` |
| GET | `/api/notifications?unreadOnly=` |
| GET | `/api/notifications/unread-count` |
| PATCH | `/api/notifications/{id}/read` |
| POST | `/api/notifications/read-all` |
| DELETE | `/api/notifications/{id}` |

`POST /api/notifications/send` is **not** publicly routed (service-to-service only).

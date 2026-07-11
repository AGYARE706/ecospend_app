# EcoSpend

Savings and expense tracking — Spring Boot microservices + React Native mobile.

## Structure

- `backend/` — Spring Boot microservices (gateway, identity, expense/finance, vault, notification)
- `mobile/` — legacy Expo scaffold on develop (prefer `ecospend-mobile/` from `main` after merge)
- `database/` — PostgreSQL init hook (Flyway owns schema)
- `docs/` — API contracts and handoff notes
- `docker-compose.yml` — run backend + database

> **Deprecated:** `backend/user-service/` is an orphan scaffold (port clash with identity). Do not add it to Compose. Identity owns users.

## Quick start

```bash
./scripts/setup-env.sh    # creates .env with JWT_SECRET (first time only)
docker compose up --build
```

Full smoke test (gateway on :8080):

```bash
./scripts/smoke-test.sh
```

Register (password auth):

```bash
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phoneNumber":"0241111111","password":"password123"}'
```

## Vault tiers

| Tier | Personal vaults | Group vaults |
|------|-----------------|--------------|
| FREE | max 3 | none |
| PLUS / PREMIUM | unlimited | max 10 |

## Docs

- [Mobile API contract](docs/API_CONTRACT_MOBILE.md)
- [Mobile QA checklist](docs/MOBILE_QA_CHECKLIST.md)
- [Backend handoff](docs/BACKEND_HANDOFF.md)

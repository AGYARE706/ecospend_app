# EcoSpend

Savings and expense tracking app — monorepo scaffold.

## Structure

- `backend/` — Spring Boot microservices
- `mobile/` — React Native (Expo) app
- `database/` — PostgreSQL init script
- `docker-compose.yml` — run backend + database

## Quick start

```bash
./scripts/setup-env.sh    # creates .env with JWT_SECRET (first time only)
docker compose up --build
```

Auth smoke test (gateway on :8080):

```bash
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phoneNumber":"0241111111","pin":"1234"}'
```

Mobile app:

```bash
cd mobile && npm install && npm start
```

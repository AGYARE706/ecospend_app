# EcoSpend

Student expense tracking app — monorepo scaffold.

## Structure

- `backend/` — Spring Boot microservices
- `mobile/` — React Native (Expo) app
- `database/` — PostgreSQL init script
- `docker-compose.yml` — run backend + database

## Quick start

```bash
docker compose up --build
```

Mobile app:

```bash
cd mobile && npm install && npm start
```
